import { Tabs } from "expo-router";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: "Auth",
        }}
      />
    </Tabs>
  );
}