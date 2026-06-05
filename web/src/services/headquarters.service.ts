import type {
  CreateHeadquarterPayload,
  Headquarter,
  UpdateHeadquarterPayload,
} from '@/types/api.types';
import { api } from './api';

export async function listHeadquarters(): Promise<Headquarter[]> {
  const { data } = await api.get<Headquarter[]>('/headquarters');
  return data;
}

export async function createHeadquarter(
  payload: CreateHeadquarterPayload,
): Promise<Headquarter> {
  const { data } = await api.post<Headquarter>('/headquarters', payload);
  return data;
}

export async function updateHeadquarter(
  id: string,
  payload: UpdateHeadquarterPayload,
): Promise<Headquarter> {
  const { data } = await api.patch<Headquarter>(`/headquarters/${id}`, payload);
  return data;
}

export async function setHeadquarterStatus(
  id: string,
  isActive: boolean,
): Promise<Headquarter> {
  const { data } = await api.patch<Headquarter>(`/headquarters/${id}/status`, {
    isActive,
  });
  return data;
}

export async function deleteHeadquarter(id: string): Promise<Headquarter> {
  const { data } = await api.delete<Headquarter>(`/headquarters/${id}`);
  return data;
}
