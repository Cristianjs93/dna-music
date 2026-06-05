import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from '@/types/api.types';
import { api } from './api';

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<User>('/users', payload);
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<User> {
  const { data } = await api.delete<User>(`/users/${id}`);
  return data;
}
