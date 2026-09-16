import { Folder } from "@repo/zod-schemas";

import {
  DEFAULT_CATEGORY_FOLDER_MERGE_DEPTH,
  type CategoryFolderMergeDepth,
  type NodeDatum,
} from "../types/types";
import { buildGraphByFolderWithThoughts } from "./buildGraphByFolder";
import { isNoteLeafId } from "./mapNoteToLeaf";
import type { ThoughtGraphRow } from "./mapThoughtToLeaf";

const stampCategoryId = (node: NodeDatum, categoryId: string): NodeDatum => ({
  ...node,
  categoryId: node.categoryId ?? categoryId,
  children: node.children?.map((child) => stampCategoryId(child, categoryId)),
});

/**
 * Category → folders (up to `maxFolderDepth`) → thoughts.
 * Empty folders are omitted; folders deeper than the cap collapse into the
 * ancestor at that depth (e.g. Work/Projects/App → Work/Projects when depth is 2).
 */
export function buildGraphByCategoryFolders(
  folders: Folder[],
  thoughts: ThoughtGraphRow[],
  options?: { maxFolderDepth?: CategoryFolderMergeDepth }
): NodeDatum {
  const maxFolderDepth =
    options?.maxFolderDepth ?? DEFAULT_CATEGORY_FOLDER_MERGE_DEPTH;
  const byCategory = new Map<string, ThoughtGraphRow[]>();

  thoughts.forEach((t) => {
    const categoryId = t.categoryId || "uncategorized";
    if (!byCategory.has(categoryId)) {
      byCategory.set(categoryId, []);
    }
    byCategory.get(categoryId)!.push(t);
  });

  return {
    id: "root",
    name: "root",
    children: Array.from(byCategory.entries()).map(
      ([categoryId, categoryThoughts]) => {
        const folderTree = buildGraphByFolderWithThoughts(
          folders,
          categoryThoughts,
          {
            maxFolderDepth,
            // Same folder under two categories must not share a graph node id,
            // or zoom/focus lands on the first match (often wrong after moves).
            folderIdScope: categoryId,
            keepEmptyFolders: false,
          }
        );
        return {
          id: `category-${categoryId}`,
          name: categoryId,
          categoryId,
          children: (folderTree.children ?? []).map((child) =>
            stampCategoryId(child, categoryId)
          ),
        };
      }
    ),
  };
}

/**
 * True when category packs still flatten thoughts under the category, keep
 * empty folders, or use unscoped folder ids.
 */
export const categoryGraphNeedsRebuild = (root: NodeDatum): boolean => {
  for (const category of root.children ?? []) {
    if (!category.id.startsWith("category-")) continue;
    const categoryId =
      category.categoryId ?? category.id.slice("category-".length);

    for (const child of category.children ?? []) {
      // Flat thought leaves under category = missing folder layer.
      if (child.thoughtId || isNoteLeafId(child.id)) return true;

      if (child.isEmptyFolder) return true;

      const isFolderChild =
        child.folderId != null || child.id.startsWith("folder-");
      if (!isFolderChild) continue;

      // Scoped ids look like `folder-${categoryId}-…`
      if (!child.id.startsWith(`folder-${categoryId}-`)) {
        return true;
      }
    }
  }
  return false;
};
