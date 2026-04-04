import { Tabs } from "expo-router";

import { CustomTabBar } from "@/components/layout/tabs/customTabBar";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => null,
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recorder",
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: "Graph",
        }}
      />
    </Tabs>
  );
}
