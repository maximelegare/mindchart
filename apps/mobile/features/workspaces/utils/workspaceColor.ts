import { PROFILE_COLORS } from "../data/profileColors";

export type WorkspaceColor = [string, string];

export const DEFAULT_WORKSPACE_COLOR: WorkspaceColor = [
  PROFILE_COLORS.veryBlue[0],
  PROFILE_COLORS.veryBlue[1],
];

/** Normalize persisted workspace color (tuple or legacy single hex). */
export function parseWorkspaceColor(
  color: unknown
): WorkspaceColor | undefined {
  if (
    Array.isArray(color) &&
    color.length === 2 &&
    typeof color[0] === "string" &&
    typeof color[1] === "string"
  ) {
    return [color[0], color[1]];
  }
  if (typeof color === "string" && color.length > 0) {
    return [color, color];
  }
  return undefined;
}
