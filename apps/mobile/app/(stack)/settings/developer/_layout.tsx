import { Stack } from "expo-router";
import {
  settingsDbInspectorPageTitle,
  settingsDeveloperOptionsPageTitle,
} from "@/features/settings/settingsLabels";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, header: () => null }}>
      <Stack.Screen
        name="index"
        options={{
          title: settingsDeveloperOptionsPageTitle(),
          headerShown: false,
          header: () => null,
        }}
      />
      <Stack.Screen
        name="inspector"
        options={{
          title: settingsDbInspectorPageTitle(),
          headerShown: false,
          header: () => null,
        }}
      />
    </Stack>
  );
}
