import { axiosInstance } from './axiosInstance';

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  phone?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const employeeApi = {
  getMe: () => axiosInstance.get('/employees/me'),
  getById: (id: string) => axiosInstance.get(`/employees/${id}`),
  getAll: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get('/employees', { params }),
  create: (data: { name: string; email: string; password: string; position: string; phone?: string }) =>
    axiosInstance.post('/employees', data),
  update: (id: string, data: Partial<{ name: string; email: string; password?: string; position: string; phone?: string }>) =>
    axiosInstance.put(`/employees/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`/employees/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return axiosInstance.post(`/employees/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
