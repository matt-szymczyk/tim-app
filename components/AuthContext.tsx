import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeValue, getValue, deleteValue } from '../components/storage';
import { 
  useAuthRequest, 
  ResponseType, 
  exchangeCodeAsync, 
  revokeAsync, 
  refreshAsync,
  makeRedirectUri
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// Fill in your Cognito details
const clientId = '5o5kgscohrkogihj339mgj1ol8';
const userPoolUrl = 'https://timapp.auth.eu-north-1.amazoncognito.com';
// Generate redirect URI with proper Linking configuration
const redirectUri = makeRedirectUri({
  scheme: 'myapp',
  path: 'redirect',
});

const discoveryDocument = {
  authorizationEndpoint: userPoolUrl + '/oauth2/authorize',
  tokenEndpoint: userPoolUrl + '/oauth2/token',
  revocationEndpoint: userPoolUrl + '/oauth2/revoke',
};

// // Helper: store / retrieve from SecureStore
// async function saveTokensToStore(tokens) {
//   await SecureStore.setItemAsync('authTokens', JSON.stringify(tokens));
// }
// async function getTokensFromStore() {
//   const stored = await SecureStore.getItemAsync('authTokens');
//   return stored ? JSON.parse(stored) : null;
// }
// async function clearTokensFromStore() {
//   await SecureStore.deleteItemAsync('authTokens');
// }


// Instead of SecureStore, do:
async function saveTokensToStore(tokens) {
  await storeValue('authTokens', JSON.stringify(tokens));
}
async function getTokensFromStore() {
  const stored = await getValue('authTokens');
  return stored ? JSON.parse(stored) : null;
}
async function clearTokensFromStore() {
  await deleteValue('authTokens');
}

// Define the shape of our context
interface AuthContextProps {
  authTokens: any; // you might define a more specific type
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextProps>(null!);

// Provide a custom hook
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authTokens, setAuthTokens] = useState<any>(null);

  // Make an auth request
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true,
      scopes: ['openid', 'email', 'profile'],
    },
    discoveryDocument
  );

  // On mount, try to load existing tokens from secure store
  useEffect(() => {
    (async () => {
      const storedTokens = await getTokensFromStore();
      if (storedTokens) {
        setAuthTokens(storedTokens);
      }
    })();
  }, []);

  // Exchange code when `response` comes back
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code) {
        console.log('Auth success, exchanging code for tokens');
        exchangeFn(code);
      }
    } else if (response) {
      console.log('Auth response not successful:', response.type);
    }
  }, [response]);

  // Exchange code for access/refresh token
  const exchangeFn = async (code: string) => {
    try {
      console.log('Exchanging code for tokens using redirect URI:', redirectUri);
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: { code_verifier: request?.codeVerifier },
        },
        discoveryDocument
      );
      
      console.log('Token exchange successful');
      setAuthTokens(tokenResponse);
      await saveTokensToStore(tokenResponse);
      
      // Show success alert so user knows login worked
      if (Platform.OS !== 'web') {
        Alert.alert('Login Successful', 'You are now logged in.');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      
      // Show error alert so user knows what happened
      if (Platform.OS !== 'web') {
        Alert.alert('Login Failed', 'There was a problem logging in. Please try again.');
      }
    }
  };

  // Manual login flow triggers Cognito Hosted UI
  const signIn = async () => {
    try {
      console.log('Starting auth flow with redirect URI:', redirectUri);
      
      // Close any existing sessions first
      await WebBrowser.dismissAuthSession();
      
      const result = await promptAsync({ 
        useProxy: false,
        showInRecents: true,
        createTask: false, // Important for seamless redirection on Android
      });
      
      if (result.type !== 'success') {
        console.log('Auth was dismissed or failed:', result);
        if (Platform.OS !== 'web' && result.type === 'cancel') {
          Alert.alert('Login Cancelled', 'The login process was cancelled.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      if (Platform.OS !== 'web') {
        Alert.alert('Login Error', 'There was a problem starting the login process.');
      }
    }
  };

  // Revoke & clear
  const signOut = async () => {
    try {
      if (authTokens?.refreshToken) {
        await revokeAsync(
          {
            clientId,
            token: authTokens.refreshToken,
          },
          discoveryDocument
        );
      }
    } catch (err) {
      console.log('revoke error', err);
    }
    // Clear local
    setAuthTokens(null);
    await clearTokensFromStore();
  };

  // Refresh tokens if about to expire
  const refreshTokens = async () => {
    if (!authTokens?.refreshToken) return;
    try {
      const refreshed = await refreshAsync(
        {
          clientId,
          refreshToken: authTokens.refreshToken,
        },
        discoveryDocument
      );
      setAuthTokens(refreshed);
      await saveTokensToStore(refreshed);
    } catch (error) {
      console.error('refresh error', error);
      // Possibly force sign out?
      // signOut();
    }
  };

  const value: AuthContextProps = {
    authTokens,
    isAuthenticated: !!authTokens?.accessToken,
    signIn,
    signOut,
    refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
