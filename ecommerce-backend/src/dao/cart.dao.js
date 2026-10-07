import { CartModel } from './models/cart.model.js';

export class CartDAO {
  async create() { return await CartModel.create({ products: [] }); }
  async getById(id) { return await CartModel.findById(id).populate('products.product'); }
  async update(id, cartData) { return await CartModel.findByIdAndUpdate(id, cartData, { new: true }); }
}