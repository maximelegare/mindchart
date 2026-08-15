export const CREATE_ACTION_KEYS = ["notes", "folders", "aiGenerated"] as const;

export type CreateActionKey = (typeof CREATE_ACTION_KEYS)[number];

export type CreateActionColorSet = {
  /** Icon button fill */
  background: string;
  /** Icon glyph / contrast on background */
  foreground: string;
  /** Softer fill for the text label chip */
  label: string;
  /** Label text */
  labelForeground: string;
};

/**
 * Accent colors for FAB create options (notes / folders / AI).
 * Values are HSL channels (no `hsl()` wrapper), matching THEME_CONFIG.
 *
 * - notes → blue
 * - folders → yellow
 * - aiGenerated → red
 */
export const CREATE_ACTION_COLORS = {
  light: {
    notes: {
      // Blue
      background: "210, 75%, 52%",
      foreground: "0, 0%, 100%",
      label: "210, 70%, 92%",
      labelForeground: "210, 50%, 28%",
    },
    folders: {
      // Yellow
      background: "45, 92%, 48%",
      foreground: "0, 0%, 100%",
      label: "48, 90%, 90%",
      labelForeground: "35, 55%, 22%",
    },
    aiGenerated: {
      // Red
      background: "0, 72%, 50%",
      foreground: "0, 0%, 100%",
      label: "0, 70%, 93%",
      labelForeground: "0, 55%, 30%",
    },
  },
  dark: {
    notes: {
      background: "210, 80%, 58%",
      foreground: "0, 0%, 100%",
      label: "210, 35%, 18%",
      labelForeground: "210, 70%, 85%",
    },
    folders: {
      background: "45, 90%, 52%",
      foreground: "0, 0%, 100%",
      label: "45, 30%, 16%",
      labelForeground: "48, 85%, 78%",
    },
    aiGenerated: {
      background: "0, 75%, 55%",
      foreground: "0, 0%, 100%",
      label: "0, 35%, 16%",
      labelForeground: "0, 80%, 82%",
    },
  },
} as const satisfies Record<
  "light" | "dark",
  Record<CreateActionKey, CreateActionColorSet>
>;
