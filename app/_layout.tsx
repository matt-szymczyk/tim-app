// app/_layout.tsx
import { Tabs } from "expo-router";
import { AuthProvider } from "../components/AuthContext"; 
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
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
              <Ionicons name="cube-outline" size={size} color={color} />
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
