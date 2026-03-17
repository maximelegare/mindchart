import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Settings", headerShown: false }}
      />
      <Stack.Screen
        name="ai"
        options={{
          headerShown: true,
          title: "AI Settings",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="database"
        options={{
          headerShown: true,
          title: "Database",
          header: () => null,
        }}
      />
    </Stack>
  );
}
