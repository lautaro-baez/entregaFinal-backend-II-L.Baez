import { Router } from 'express';
import { CartRepository } from '../repositories/cart.repository.js';
import { ProductDAO } from '../dao/product.dao.js';
import { TicketDAO } from '../dao/ticket.dao.js';
import { passportCall } from '../middlewares/auth.middleware.js';
import { authorization } from '../middlewares/role.middleware.js';

const router = Router();
const cartRepo = new CartRepository();
const productDAO = new ProductDAO();
const ticketDAO = new TicketDAO();

// Solo usuarios con rol 'user' pueden agregar productos a su carrito
router.post('/:cid/product/:pid', passportCall('current'), authorization('user'), async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await cartRepo.getCartById(cid);
    
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    const itemIndex = cart.products.findIndex(p => p.product._id.toString() === pid);
    const qtyToAdd = quantity || 1;

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity += qtyToAdd;
    } else {
      cart.products.push({ product: pid, quantity: qtyToAdd });
    }

    await cartRepo.updateCart(cid, { products: cart.products });
    res.json({ status: 'success', message: 'Producto agregado al carrito' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Proceso de Checkout / Compra
router.post('/:cid/purchase', passportCall('current'), authorization('user'), async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartRepo.getCartById(cid);

    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    let totalAmount = 0;
    const unprocessedProducts = [];

    for (const item of cart.products) {
      const product = await productDAO.getById(item.product._id);

      if (product && product.stock >= item.quantity) {
        // Descontar stock
        product.stock -= item.quantity;
        await productDAO.update(product._id, { stock: product.stock });
        totalAmount += product.price * item.quantity;
      } else {
        // Si no hay suficiente stock, conservar en el carrito
        unprocessedProducts.push(item);
      }
    }

    // Actualizar el carrito para conservar solo los no procesados
    await cartRepo.updateCart(cid, { products: unprocessedProducts });

    let ticket = null;
    if (totalAmount > 0) {
      ticket = await ticketDAO.create({
        code: `TCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: totalAmount,
        purchaser: req.user.email
      });
    }

    res.json({
      status: 'success',
      payload: {
        ticket,
        unprocessedProducts: unprocessedProducts.map(p => p.product._id)
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;