import { axiosInstance } from './axiosInstance';

export const authApi = {
  login: (email: string, password: string) =>
    axiosInstance.post('/auth/login', { email, password }),
};
