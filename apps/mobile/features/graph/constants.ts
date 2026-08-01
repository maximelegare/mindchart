import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const GRAPH_CANVAS_SIZE = SCREEN_WIDTH - 24;

/**
 * Folder-mode pack fills by nesting layer.
 * Index 0 = closest to root (lightest); deeper folders use later entries.
 */
export const FOLDER_LAYER_COLORS = [
  "#b8e0b4",
  "#68ac7e",
  "#2f8975",
  "#1e6554",
] as const;

export const folderLayerColor = (layerIndex: number): string => {
  const max = FOLDER_LAYER_COLORS.length - 1;
  const index = Math.min(Math.max(Math.floor(layerIndex), 0), max);
  return FOLDER_LAYER_COLORS[index];
};
