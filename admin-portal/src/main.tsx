import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { setupAxiosInterceptors } from './api/setupAxiosInterceptors';

// Initialize global Axios interceptors for 401 token expiration handling
setupAxiosInterceptors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
