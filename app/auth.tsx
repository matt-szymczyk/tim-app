import { useState, useMemo, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, exchangeCodeAsync, revokeAsync, ResponseType } from 'expo-auth-session';
import { Button, Alert, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const clientId = '5o5kgscohrkogihj339mgj1ol8';
const userPoolUrl = 'https://timapp.auth.eu-north-1.amazoncognito.com';
const redirectUri = Platform.select({
  native: 'myapp://auth',
  web: 'http://localhost:8081'
});

export default function Auth() {
  const [authTokens, setAuthTokens] = useState(null);
  const discoveryDocument = useMemo(() => ({
    authorizationEndpoint: userPoolUrl + '/oauth2/authorize',
    tokenEndpoint: userPoolUrl + '/oauth2/token',
    revocationEndpoint: userPoolUrl + '/oauth2/revoke',
  }), []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true,
    },
    discoveryDocument
  );

  useEffect(() => {
    const exchangeFn = async (exchangeTokenReq) => {
      try {
        const exchangeTokenResponse = await exchangeCodeAsync(
          exchangeTokenReq,
          discoveryDocument
        );
        setAuthTokens(exchangeTokenResponse);
      } catch (error) {
        console.error(error);
      }
    };
    if (response) {
      if (response.error) {
        Alert.alert(
          'Authentication error',
          response.params.error_description || 'something went wrong'
        );
        return;
      }
      if (response.type === 'success') {
        exchangeFn({
          clientId,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        });
      }
    }
  }, [discoveryDocument, request, response]);

  const logout = async () => {
    try {
      await revokeAsync(
        {
          clientId: clientId,
          token: authTokens.refreshToken,
        },
        discoveryDocument
      );
      // Regardless of the response, clear the tokens
      setAuthTokens(null);
    } catch (error) {
      // Even if revocation fails, we should still clear local tokens
      setAuthTokens(null);
      console.log('Logout error:', error);
    }
  };
  console.log('authTokens: ' + JSON.stringify(authTokens));
  return authTokens ? (
    <Button title="Logout" onPress={() => logout()} />
  ) : (
    <Button disabled={!request} title="Login" onPress={() => promptAsync()} />
  );

}
