import { useAuth } from '@clerk/clerk-react';
import { useState, useCallback } from 'react';
import { useAuthClient } from '../services/client';

interface UserRegistrationResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  clerkUserId: string;
  isNewUser: boolean;
}

export const useUserRegistration = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserRegistrationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  const authClient = useAuthClient();

  const registerUser = useCallback(async () => {
    if (!isSignedIn || !isLoaded) {
      setRegistrationError('You must be signed in to register');
      return;
    }
    
    setLoading(true);
    setRegistrationError(null);
    
    try {
      const response = await authClient.post('/users/me');
      setUserData(response.data);
      setRegistrationComplete(true);
      
      if (response.data.isNewUser) {
        console.log('New user registered successfully');
      } else {
        console.log('Existing user authenticated successfully');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      setRegistrationError('Failed to register user. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, isLoaded, authClient]);

  return {
    registrationComplete,
    registrationError,
    userData,
    loading,
    registerUser
  };
}; 