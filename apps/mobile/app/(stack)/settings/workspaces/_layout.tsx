import { Stack } from "expo-router";

export default function WorkspaceLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Workspace", headerShown: false }}
      />
      <Stack.Screen
        name="recovery"
        options={{ title: "Recovery passphrase", headerShown: false }}
      />
    </Stack>
  );
}
