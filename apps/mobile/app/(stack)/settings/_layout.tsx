import { Stack } from "expo-router";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import {
  settingsDeveloperOptionsPageTitle,
  settingsPageTitleString,
} from "@/features/settings/settingsLabels";

export default function SettingsLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: hsl("background", colorScheme),
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: settingsPageTitleString(), headerShown: false }}
      />
      <Stack.Screen
        name="developer"
        options={{
          title: settingsDeveloperOptionsPageTitle(),
          header: () => null,
        }}
      />
      {/* Legacy routes — redirect to main settings */}
      <Stack.Screen name="ai" options={{ header: () => null }} />
      <Stack.Screen name="workspaces" options={{ header: () => null }} />
      <Stack.Screen name="aboutApp" options={{ header: () => null }} />
    </Stack>
  );
}
