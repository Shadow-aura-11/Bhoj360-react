import axios from 'axios';
import { io } from 'socket.io-client';

const GATEWAY = ''; // Relative path, proxies automatically via Vite proxy in dev, serves static in prod

export const agencyApi = axios.create({ baseURL: `${GATEWAY}/api` });

// Attach agency session token to all agency API requests
agencyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('agency_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — redirect to login
agencyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('agency_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export function createApi(restaurantId) {
  const instance = axios.create({ baseURL: `${GATEWAY}/r/${restaurantId}` });
  instance.interceptors.request.use((config) => {
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    if (session.role && session.restaurantId === restaurantId) {
      config.headers['x-role'] = session.role;
      config.headers['x-pin'] = session.pin;
      if (session.username) {
        config.headers['x-username'] = session.username;
      }
    }
    return config;
  });
  return instance;
}

export function createSocket(restaurantId) {
  // Use current origin and connect to the restaurantId namespace endpoint via gateway
  const socket = io(window.location.origin, {
    path: `/r/${restaurantId}/socket.io`,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
  return socket;
}
