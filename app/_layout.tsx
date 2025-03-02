// app/_layout.tsx
import { Tabs } from "expo-router";
import * as Linking from 'expo-linking';
import { useEffect } from "react";
import { AuthProvider } from "../components/AuthContext"; 
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  // Set up deep link handling
  useEffect(() => {
    // Register a URL event listener
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Deep link detected:', event.url);
      // The URL will be handled by expo-auth-session automatically
    });

    // Get the initial URL if the app was opened through a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('App opened with URL:', url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen
          name="itemManagement"
          options={{
            title: "Items",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="accessManagement"
          options={{
            title: "Users",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="warehouses/index"
          options={{
            title: "Warehouses",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="auth"
          options={{
            title: "Auth",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="lock-closed-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
