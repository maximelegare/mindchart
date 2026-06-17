import { OptionsBar as OptionsBarType, DisplayKey, UiKey } from "../../types";

export const getDisplayKey = (
  displayMode: OptionsBarType["displayMode"],
  showOverview: boolean
): DisplayKey => {
  if (displayMode === "notes") {
    return showOverview ? "notes-overview" : "notes";
  }
  return displayMode;
};

export const getUiKey = (
  groupBy: OptionsBarType["groupBy"],
  displayMode: OptionsBarType["displayMode"],
  showOverview: boolean
): UiKey => {
  const displayKey = getDisplayKey(displayMode, showOverview);
  return `groupBy=${groupBy}&display=${displayKey}`;
};
