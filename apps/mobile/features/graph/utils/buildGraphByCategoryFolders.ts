import { Folder } from "@repo/zod-schemas/src/schemas";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";
import { buildGraphByFolderWithThoughts } from "./buildGraphByFolder";
import { isNoteLeafId } from "./mapNoteToLeaf";

const stampCategoryId = (node: NodeDatum, categoryId: string): NodeDatum => ({
  ...node,
  categoryId: node.categoryId ?? categoryId,
  children: node.children?.map((child) => stampCategoryId(child, categoryId)),
});

/**
 * Category → root folders (with content) → thoughts.
 * Empty folders are omitted; nested folders collapse into their root.
 */
export function buildGraphByCategoryFolders(
  folders: Folder[],
  thoughts: ThoughtWithEmbedding[]
): NodeDatum {
  const byCategory = new Map<string, ThoughtWithEmbedding[]>();

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
            maxFolderDepth: 1,
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
 * True when category packs still nest empty/nested folders, use unscoped
 * folder ids, or flatten thoughts directly under the category.
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

      const hasNestedFolder = (child.children ?? []).some(
        (nested) =>
          !nested.thoughtId &&
          !isNoteLeafId(nested.id) &&
          (nested.folderId != null || nested.id.startsWith("folder-"))
      );
      if (hasNestedFolder) return true;
    }
  }
  return false;
};
