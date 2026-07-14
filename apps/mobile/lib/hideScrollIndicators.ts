import {
  FlatList,
  ScrollView,
  SectionList,
  VirtualizedList,
} from "react-native";
import { ScrollView as GHScrollView } from "react-native-gesture-handler";

const scrollIndicatorDefaults = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
} as const;

function applyScrollDefaults(Component: {
  defaultProps?: Record<string, unknown> | null;
}) {
  Component.defaultProps = {
    ...Component.defaultProps,
    ...scrollIndicatorDefaults,
  };
}

applyScrollDefaults(ScrollView);
applyScrollDefaults(FlatList);
applyScrollDefaults(SectionList);
applyScrollDefaults(VirtualizedList);
applyScrollDefaults(GHScrollView);
