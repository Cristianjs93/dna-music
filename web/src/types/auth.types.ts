import type { User } from './user.types';

export interface AuthResponse {
  accessToken: string;
  user: User;
}
