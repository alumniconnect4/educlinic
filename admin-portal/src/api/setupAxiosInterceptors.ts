import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

let isRedirecting = false;

export const setupAxiosInterceptors = () => {
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use(
    (config) => {
      const token =
        useAuthStore.getState().token || localStorage.getItem('adminToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Catch 401 Unauthorized (Token expired / invalid session)
      if (error.response && error.response.status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          if (!isRedirecting) {
            isRedirecting = true;
            useAuthStore.getState().logout();
            toast.error('Session expired. Please log in again.');
            setTimeout(() => {
              window.location.href = '/login';
              isRedirecting = false;
            }, 300);
          }
        }
      }
      return Promise.reject(error);
    }
  );
};
