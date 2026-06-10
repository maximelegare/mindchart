import { Stack } from "expo-router";

export default function TopicsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Topics", headerShown: false, header: () => null }}
      />
    </Stack>
  );
}
