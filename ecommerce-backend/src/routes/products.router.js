import { Router } from 'express';
import { ProductDAO } from '../dao/product.dao.js';
import { passportCall } from '../middlewares/auth.middleware.js';
import { authorization } from '../middlewares/role.middleware.js';

const router = Router();
const productDAO = new ProductDAO();

router.get('/', async (req, res) => {
  const products = await productDAO.getAll();
  res.json({ status: 'success', payload: products });
});

// Solo admin puede crear productos
router.post('/', passportCall('current'), authorization('admin'), async (req, res) => {
  try {
    const product = await productDAO.create(req.body);
    res.status(201).json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Solo admin puede actualizar productos
router.put('/:pid', passportCall('current'), authorization('admin'), async (req, res) => {
  try {
    const updated = await productDAO.update(req.params.pid, req.body);
    res.json({ status: 'success', payload: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Solo admin puede eliminar productos
router.delete('/:pid', passportCall('current'), authorization('admin'), async (req, res) => {
  try {
    await productDAO.delete(req.params.pid);
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

export default router;