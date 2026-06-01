import { http } from '@/services/http';
import type { AuthUser } from '@/store/auth.store';

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string) {
    const { data } = await http.post<{ data: LoginResponse }>('/auth/login', { email, password });
    return data.data;
  },
  async logout() {
    await http.post('/auth/logout');
  },
  async me() {
    const { data } = await http.get<{ data: AuthUser }>('/users/me');
    return data.data;
  },
};
