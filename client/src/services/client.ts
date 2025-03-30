import axios from "axios";
import { useAuth } from '@clerk/clerk-react';

const baseURL = import.meta.env.VITE_MEALMANAGER_BASE_URL + "/api";
export const publicClient = axios.create({
    baseURL,
    headers: {
        "Content-type": "application/json"
    }
})

// Hook to get an authenticated client
export const useAuthClient = () => {
    const { getToken } = useAuth();
    
    const authClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    authClient.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    return authClient;
};