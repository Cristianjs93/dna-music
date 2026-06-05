import type { StatsResponse } from '@/types/api.types';
import { api } from './api';

export async function getStats(): Promise<StatsResponse> {
  const { data } = await api.get<StatsResponse>('/stats');
  return data;
}
