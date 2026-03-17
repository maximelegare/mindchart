import { ViewStyle, Platform } from "react-native";

// Define a "size" type (optional)
type ShadowSize = "sm" | "md" | "lg";

// Base shadow values for each size
const SHADOW_PRESETS: Record<ShadowSize, ViewStyle> = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Function returning a ViewStyle
export const dropshadow = (size: ShadowSize = "md"): ViewStyle => {
  const shadow = SHADOW_PRESETS[size];

  // On Android, only elevation matters; ignore iOS props if you want
  if (Platform.OS === "android") {
    return { elevation: shadow.elevation, backgroundColor: "white" }; // elevation requires bg
  }

  // iOS
  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
  };
};
