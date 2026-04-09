import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, header: () => null }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Developer Settings",
          headerShown: false,
          header: () => null,
        }}
      />
      <Stack.Screen
        name="inspector"
        options={{ title: "Inspector", headerShown: false, header: () => null }}
      />
    </Stack>
  );
}
