import { OptionsBar as OptionsBarType, DisplayKey, UiKey } from "../../types";

export const getDisplayKey = (
  displayMode: OptionsBarType["displayMode"]
): DisplayKey => {
  // Notes always render with overview content.
  if (displayMode === "notes") {
    return "notes-overview";
  }
  return displayMode;
};

export const getUiKey = (
  groupBy: OptionsBarType["groupBy"],
  displayMode: OptionsBarType["displayMode"]
): UiKey => {
  const displayKey = getDisplayKey(displayMode);
  return `groupBy=${groupBy}&display=${displayKey}`;
};
