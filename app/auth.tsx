// app/auth.tsx
import { Button, Text, View } from 'react-native';
import { useAuth } from "../components/AuthContext";

export default function AuthScreen() {
  const { isAuthenticated, signIn, signOut } = useAuth();

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      {isAuthenticated ? (
        <>
          <Text>You are logged in!</Text>
          <Button title="Logout" onPress={signOut} />
        </>
      ) : (
        <>
          <Text>You are logged out!</Text>
          <Button title="Login" onPress={signIn} />
        </>
      )}
    </View>
  );
}
