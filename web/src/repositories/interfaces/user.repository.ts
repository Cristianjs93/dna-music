import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from '@/types/user.types';

export interface IUserRepository {
  list(): Promise<User[]>;
  create(payload: CreateUserPayload): Promise<User>;
  update(id: string, payload: UpdateUserPayload): Promise<User>;
  delete(id: string): Promise<User>;
}
