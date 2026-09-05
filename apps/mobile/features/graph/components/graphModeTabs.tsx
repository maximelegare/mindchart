import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { THEME_CONFIG } from "@repo/theme/global";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useGraphStore } from "../context/graphContext";
import type { GraphMode } from "../types/types";
import {
  GraphCategoriesTabLabel,
  GraphFoldersTabLabel,
} from "./graphModeLabels";

const schemeOf = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => (colorScheme === "dark" ? "dark" : "light");

/** Same fill as the graph canvas. */
const graphSurface = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => hsl("card", "theme", schemeOf(colorScheme));

/** Unselected tab strip — a touch lighter than the graph. */
const tabBarSurface = (
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"]
) => {
  const scheme = schemeOf(colorScheme);
  const [h, s, lRaw] = THEME_CONFIG[scheme].card
    .split(",")
    .map((p) => p.trim());
  const l = parseFloat(lRaw);
  const lift = scheme === "dark" ? 7 : 4;
  return `hsl(${h}, ${s}, ${Math.min(100, l + lift)}%)`;
};

const TABS: {
  mode: GraphMode;
  icon: IconName;
  Label: () => ReactNode;
}[] = [
  { mode: "category", icon: "shapes", Label: GraphCategoriesTabLabel },
  { mode: "folder", icon: "folder", Label: GraphFoldersTabLabel },
];

/** Excel-style sheet tabs for Categories ↔ Folders. */
export const GraphModeTabs = () => {
  const mode = useGraphStore((state) => state.mode);
  const setGraphMode = useGraphStore((state) => state.setGraphMode);
  const { colorScheme } = useColorScheme();
  const borderColor = hsl("border", colorScheme);
  const graphBg = graphSurface(colorScheme);
  const barBg = tabBarSurface(colorScheme);

  return (
    <View style={[styles.bar, { backgroundColor: barBg }]}>
      <View style={styles.row}>
        {TABS.map(({ mode: tabMode, icon, Label }) => {
          const selected = mode === tabMode;
          return (
            <Pressable
              key={tabMode}
              onPress={() => setGraphMode(tabMode)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[
                styles.tab,
                {
                  backgroundColor: selected ? graphBg : "transparent",
                  borderBottomColor: selected ? graphBg : borderColor,
                },
              ]}
            >
              <Icon
                size={16}
                name={icon}
                color={selected ? "foreground" : "muted-foreground"}
              />
              <Typography
                variant="small"
                className={selected ? undefined : "text-muted-foreground"}
                style={styles.label}
              >
                <Label />
              </Typography>
            </Pressable>
          );
        })}
        <View
          style={[styles.rule, styles.tail, { borderBottomColor: borderColor }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  rule: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tail: {
    flex: 1,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: "QuicksandBold",
  },
});
