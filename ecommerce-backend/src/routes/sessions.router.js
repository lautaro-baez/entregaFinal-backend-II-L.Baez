import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { CartRepository } from '../repositories/cart.repository.js';
import { passportCall } from '../middlewares/auth.middleware.js';
import { transporter } from '../utils/mailer.js';

const router = Router();
const userRepo = new UserRepository();
const cartRepo = new CartRepository();

// Registro
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password, role } = req.body;
  try {
    const existingUser = await userRepo.getUserByEmail(email);
    if (existingUser) return res.status(400).json({ status: 'error', message: 'El correo ya está registrado' });

    const newCart = await cartRepo.createCart();
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const newUser = await userRepo.createUser({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      cart: newCart._id,
      role: role || 'user'
    });

    res.status(201).json({ status: 'success', message: 'Usuario registrado correctamente', payload: newUser });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userRepo.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('jwtCookie', token, { httpOnly: true }).json({ status: 'success', token });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Endpoint Current (Retorna UserDTO sin información sensible)
router.get('/current', passportCall('current'), (req, res) => {
  res.json({ status: 'success', payload: req.user });
});

// Solicitud de recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userRepo.getUserByEmail(email);
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 Hora exactos

    await userRepo.updateUser(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(expires)
    });

    const resetUrl = `${process.env.APP_URL}/api/sessions/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.MAILING_USER,
      to: email,
      subject: 'Restablecimiento de Contraseña',
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar (válido por 1 hora):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    res.json({ status: 'success', message: 'Correo de restablecimiento enviado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Restablecer contraseña con token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await userRepo.getUserByToken(token);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ status: 'error', message: 'El token es inválido o ha expirado' });
    }

    if (bcrypt.compareSync(newPassword, user.password)) {
      return res.status(400).json({ status: 'error', message: 'No puedes usar la misma contraseña anterior' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    await userRepo.updateUser(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ status: 'success', message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;