import { ComponentType } from "react";
import { UiKey } from "../../types";
import { NotesListWithOverviewFeature } from "../../features/groupByNone/withOverview/views";
import { TopicsOnlyViewFeature } from "../../features/groupByTopics/topicsOnly";
import { getUiKey } from "./getUiKey";

/**
 * Maps each options-bar combination to a dedicated view.
 * Add a new entry here whenever a unique groupBy + display combo needs its own UI.
 *
 * Example — overview toggled off switches to a different view entirely:
 *   "groupBy=none&display=notes-overview-topics" → NotesListWithOverviewFeature
 *   "groupBy=none&display=notes-topics"          → NotesListWithoutOverviewFeature
 */
export const CONTENT_VIEW_REGISTRY = {
  "groupBy=none&display=notes": NotesListWithOverviewFeature,
  "groupBy=none&display=topics": TopicsOnlyViewFeature,
  "groupBy=topics&display=topics": TopicsOnlyViewFeature,
} as const satisfies Partial<Record<UiKey, ComponentType>>;

export type RegisteredUiKey = keyof typeof CONTENT_VIEW_REGISTRY;

const FALLBACK_VIEW = NotesListWithOverviewFeature;

export const resolveContentView = (uiKey: UiKey | null): ComponentType => {
  if (!uiKey) return FALLBACK_VIEW;

  if (uiKey in CONTENT_VIEW_REGISTRY) {
    return CONTENT_VIEW_REGISTRY[uiKey as RegisteredUiKey];
  }

  if (__DEV__) {
    console.warn(
      `[contentViewRegistry] No view registered for "${uiKey}", using fallback.`
    );
  }

  return FALLBACK_VIEW;
};

export const resolveContentViewFromOptions = (
  groupBy: Parameters<typeof getUiKey>[0],
  display: Parameters<typeof getUiKey>[1]
): ComponentType => resolveContentView(getUiKey(groupBy, display));
