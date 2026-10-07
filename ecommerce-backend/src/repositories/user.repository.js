import { UserDAO } from '../dao/user.dao.js';
import { UserDTO } from '../dto/user.dto.js';

const userDAO = new UserDAO();

export class UserRepository {
  async getUserById(id) {
    const user = await userDAO.getById(id);
    return user ? new UserDTO(user) : null;
  }
  async getUserByEmail(email) {
    return await userDAO.getByEmail(email);
  }
  async createUser(userData) {
    return await userDAO.create(userData);
  }
  async updateUser(id, userData) {
    return await userDAO.update(id, userData);
  }
  async getUserByToken(token) {
    return await userDAO.getByToken(token);
  }
}