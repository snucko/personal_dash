import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GoogleUserProfile } from '../types';
import { getUserInfo } from '../services/googleApiService';

interface AuthContextType {
  accessToken: string | null;
  userProfile: GoogleUserProfile | null;
  isConnecting: boolean;
  authError: { type: 'generic' | 'config'; message: string } | null;
  handleConnectGoogle: () => void;
  handleDisconnect: () => void;
  setAuthError: (error: { type: 'generic' | 'config'; message: string } | null) => void;
  tokenClient: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState<{ type: 'generic' | 'config'; message: string } | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured = GOOGLE_CLIENT_ID !== '' && GOOGLE_CLIENT_ID !== 'YOUR_LOCAL_CLIENT_ID_HERE';

  const handleTokenResponse = async (token: string) => {
    setAccessToken(token);
    try {
      const profile = await getUserInfo(token);
      setUserProfile(profile);
    } catch (error) {
      console.error('Google authentication failed:', error);
      setAuthError({
        type: 'generic',
        message: error instanceof Error ? error.message : 'Failed to fetch user data. Please try again.'
      });
      setAccessToken(null);
      setUserProfile(null);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!isConfigured) return;

    const loadGoogleScript = () => {
      return new Promise((resolve) => {
        if (window.google?.accounts?.oauth2) {
          resolve(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    };

    const initializeGsi = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar.events.readonly',
            'https://www.googleapis.com/auth/tasks'
          ].join(' '),
          callback: (tokenResponse: { access_token?: string; error?: any; error_description?: string }) => {
            if (tokenResponse.error) {
              console.error('Google token error:', tokenResponse);
              if (tokenResponse.error === 'invalid_request' || tokenResponse.error_description?.includes('origin')) {
                setAuthError({
                  type: 'config',
                  message: `Configuration Error: ${tokenResponse.error_description || 'Invalid Request'}. Check your Authorized Origins.`
                });
              } else {
                setAuthError({
                  type: 'generic',
                  message: `Authentication failed: ${tokenResponse.error_description || tokenResponse.error.toString()}`
                });
              }
              setIsConnecting(false);
            } else if (tokenResponse.access_token) {
              handleTokenResponse(tokenResponse.access_token);
            }
          }
        });
        setTokenClient(client);
      }
    };

    loadGoogleScript().then(() => {
      let attempts = 0;
      const intervalId = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2?.initTokenClient) {
          initializeGsi();
          clearInterval(intervalId);
        }
        if (attempts > 300) {  // 30 seconds timeout
          console.error('Google GSI failed to load after 30 seconds');
          clearInterval(intervalId);
        }
      }, 100);
      
      return () => clearInterval(intervalId);
    });
  }, [isConfigured, GOOGLE_CLIENT_ID]);

  const handleConnectGoogle = () => {
    if (tokenClient) {
      setIsConnecting(true);
      setAuthError(null);
      tokenClient.requestAccessToken();
    } else {
      setAuthError({ type: 'generic', message: 'Google Sign-In is not ready. Please try again.' });
      console.warn('Google Identity Services client not initialized.');
    }
  };

  const handleDisconnect = () => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Access token revoked.');
      });
    }
    setAccessToken(null);
    setUserProfile(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userProfile,
        isConnecting,
        authError,
        handleConnectGoogle,
        handleDisconnect,
        setAuthError,
        tokenClient
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
