// app/_layout.tsx
import { Tabs } from "expo-router";
import { AuthProvider } from "../components/AuthContext";  // import your new AuthProvider

export default function RootLayout() {
  return (
    <AuthProvider>
      <Tabs>
        <Tabs.Screen
          name="itemManagement"
          options={{ title: "Items" }}
        />
        {/* Add a screen for warehouses */}
        <Tabs.Screen
          name="warehouses/index"
          options={{ title: "Warehouses" }}
        />
      <Tabs.Screen
        name="auth"
        options={{ title: "Auth" }}
      />
      </Tabs>
    </AuthProvider>
  );
}
