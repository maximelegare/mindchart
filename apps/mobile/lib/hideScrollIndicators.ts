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

type WithDefaultProps = {
  defaultProps?: Record<string, unknown> | null;
};

function applyScrollDefaults(Component: object) {
  const target = Component as WithDefaultProps;
  target.defaultProps = {
    ...target.defaultProps,
    ...scrollIndicatorDefaults,
  };
}

applyScrollDefaults(ScrollView);
applyScrollDefaults(FlatList);
applyScrollDefaults(SectionList);
applyScrollDefaults(VirtualizedList);
applyScrollDefaults(GHScrollView);
