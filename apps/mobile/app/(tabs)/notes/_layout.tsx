import { Stack } from "expo-router";

export default function NotesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Notes", headerShown: false, header: () => null }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          header: () => null,
        }}
      />
    </Stack>
  );
}
