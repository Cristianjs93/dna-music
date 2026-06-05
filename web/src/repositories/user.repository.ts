import type { IUserRepository } from './interfaces/user.repository';
import * as usersService from '@/services/users.service';

export const userRepository: IUserRepository = {
  list: usersService.listUsers,
  create: usersService.createUser,
  update: usersService.updateUser,
  delete: usersService.deleteUser,
};
