import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../repositories/user.repository.js';
import dotenv from 'dotenv';

dotenv.config();
const userRepo = new UserRepository();

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) token = req.cookies['jwtCookie'];
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
  }
  return token;
};

export const initializePassport = () => {
  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET || 'secretoSuperSeguro123',
      },
      async (jwt_payload, done) => {
        try {
          const user = await userRepo.getUserById(jwt_payload.id);
          if (!user) return done(null, false, { message: 'Usuario no encontrado' });
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};