import { OptionsBar as OptionsBarType, DisplayKey, UiKey } from "../../types";

export const getDisplayKey = (
  display: OptionsBarType["display"]
): DisplayKey | null => {
  if (display.length === 0) return null;
  return [...new Set(display)].sort().join("-") as DisplayKey;
};

export const getUiKey = (
  groupBy: OptionsBarType["groupBy"],
  display: OptionsBarType["display"]
): UiKey | null => {
  const displayKey = getDisplayKey(display);
  if (!displayKey) return null;
  return `groupBy=${groupBy}&display=${displayKey}`;
};
