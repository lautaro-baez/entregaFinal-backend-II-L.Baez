import { CartDAO } from '../dao/cart.dao.js';

const cartDAO = new CartDAO();

export class CartRepository {
  async createCart() { return await cartDAO.create(); }
  async getCartById(id) { return await cartDAO.getById(id); }
  async updateCart(id, cartData) { return await cartDAO.update(id, cartData); }
}