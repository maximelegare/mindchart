import { ComponentType } from "react";
import { UiKey } from "../../types";
import { NotesListWithOverviewFeature } from "@/features/contentList/features/groupByNone/views/withOverview";
import { NotesListGroupByFoldersWithoutOverviewFeature } from "@/features/contentList/features/groupByFolders/notes/views/withoutOverview";
import { NotesListGroupByFoldersWithOverviewFeature } from "@/features/contentList/features/groupByFolders/notes/views/withOverview";
import { NotesListGroupByDatesWithoutOverviewFeature } from "@/features/contentList/features/groupByDates/notes/views/withoutOverview";
import { NotesListGroupByDatesWithOverviewFeature } from "@/features/contentList/features/groupByDates/notes/views/withOverview";
import { getUiKey } from "./getUiKey";

import { NotesListWithoutOverviewFeature } from "@/features/contentList/features/groupByNone/views/withoutOverview";
import { CategoriesOnlyViewFeature } from "@/features/contentList/features/groupByCategories/categoriesOnly";
import { ThoughtsListGroupByCategoriesWithoutOverviewFeature } from "@/features/contentList/features/groupByCategories/thoughts/views/withoutOverview";
import { ThoughtsListGroupByCategoriesWithOverviewFeature } from "@/features/contentList/features/groupByCategories/thoughts/views/withOverview";

/**
 * Maps each groupBy + display combination to a dedicated view.
 * display is one of: notes, notes-overview, categories.
 */
export const CONTENT_VIEW_REGISTRY = {
  "groupBy=none&display=notes": NotesListWithoutOverviewFeature,
  "groupBy=none&display=notes-overview": NotesListWithOverviewFeature,
  "groupBy=none&display=categories": CategoriesOnlyViewFeature,

  "groupBy=folders&display=notes":
    NotesListGroupByFoldersWithoutOverviewFeature,
  "groupBy=folders&display=notes-overview":
    NotesListGroupByFoldersWithOverviewFeature,
  "groupBy=folders&display=categories": CategoriesOnlyViewFeature,

  "groupBy=dates&display=notes": NotesListGroupByDatesWithoutOverviewFeature,
  "groupBy=dates&display=notes-overview":
    NotesListGroupByDatesWithOverviewFeature,
  "groupBy=dates&display=categories": CategoriesOnlyViewFeature,

  "groupBy=categories&display=categories": CategoriesOnlyViewFeature,
  "groupBy=categories&display=notes":
    ThoughtsListGroupByCategoriesWithoutOverviewFeature,
  "groupBy=categories&display=notes-overview":
    ThoughtsListGroupByCategoriesWithOverviewFeature,
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
  displayMode: Parameters<typeof getUiKey>[1]
): ComponentType => resolveContentView(getUiKey(groupBy, displayMode));
