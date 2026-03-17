import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Database", headerShown: false, header: () => null }}
      />
      <Stack.Screen
        name="inspector"
        options={{ title: "Inspector", headerShown: false, header: () => null }}
      />
    </Stack>
  );
}
