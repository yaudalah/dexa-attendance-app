import { axiosInstance } from './axiosInstance';

export const attendanceApi = {
  checkInOut: (type: 'in' | 'out') =>
    axiosInstance.post('/attendance', { type }),
    getHistory: (params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => axiosInstance.get('/attendance/history', { params }),
  getMonitoring: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get('/attendance/monitoring', { params }),
};
