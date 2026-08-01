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
        dangerouslySingular={() => "graph-id"}
        options={{
          headerShown: false,
          animation: "none",
          title: "Graph",
          header: () => null,
        }}
      />
      <Stack.Screen
        name="note/[id]"
        options={{
          headerShown: false,
          header: () => null,
          title: "Note",
        }}
      />
    </Stack>
  );
}
