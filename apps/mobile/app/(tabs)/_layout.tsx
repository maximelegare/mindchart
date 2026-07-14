import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomTabBar } from "@/components/layout/tabs/customTabBar";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { FloatingModal } from "@/features/notes/noteCreation/features/floatingButton/views";
import { NoteCreationProvider } from "@/features/notes/noteCreation/context/noteCreationContext";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const topOffset = LAYOUT_SIZES.HEADER_HEIGHT + insets.top;

  return (
    <NoteCreationProvider>
      <View style={styles.root}>
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

        <View style={styles.floatingLayer} pointerEvents="box-none">
          <FloatingModal topOffset={topOffset} />
        </View>
      </View>
    </NoteCreationProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
});
