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
          title: "AI Settings",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="developer"
        options={{
          title: "Developer Options",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="workspace"
        options={{
          title: "Workspace Settings",
          header: () => null,
        }}
      />
    </Stack>
  );
}
