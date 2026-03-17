import { Stack } from "expo-router";

export default function GraphLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Graph",
          headerShown: false,
          header: () => null,
          animation: "none",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          animation: "none",
          title: "Note",
          header: () => null,
        }}
      />
    </Stack>
  );
}
