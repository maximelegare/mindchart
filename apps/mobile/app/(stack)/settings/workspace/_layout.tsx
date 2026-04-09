import { Stack } from "expo-router";

export default function WorkspaceLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Workspace Settings", headerShown: false }}
      />
    </Stack>
  );
}
