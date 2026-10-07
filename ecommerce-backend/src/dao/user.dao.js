import { UserModel } from './models/user.model.js';

export class UserDAO {
  async getById(id) { return await UserModel.findById(id); }
  async getByEmail(email) { return await UserModel.findOne({ email }); }
  async getByToken(token) { return await UserModel.findOne({ resetPasswordToken: token }); }
  async create(userData) { return await UserModel.create(userData); }
  async update(id, userData) { return await UserModel.findByIdAndUpdate(id, userData, { new: true }); }
}