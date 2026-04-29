import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, header: () => null }}>
      <Stack.Screen
        name="index"
        options={{
          title: "About App",
          headerShown: false,
          header: () => null,
        }}
      />
    </Stack>
  );
}
