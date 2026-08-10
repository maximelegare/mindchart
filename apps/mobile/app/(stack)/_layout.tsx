import { Stack } from "expo-router";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

export default function StackGroupLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: () => null,
        contentStyle: {
          backgroundColor: hsl("background", colorScheme),
        },
      }}
    />
  );
}
