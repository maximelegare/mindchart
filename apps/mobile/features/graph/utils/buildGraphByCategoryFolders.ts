import { Folder } from "@repo/zod-schemas/src/schemas";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";
import { buildGraphByFolder } from "./buildGraphByFolder";

/** Category → nested folders → thoughts (replaces the old category → topic tree). */
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
        const folderTree = buildGraphByFolder(folders, categoryThoughts);
        return {
          id: `category-${categoryId}`,
          name: categoryId,
          categoryId,
          children: folderTree.children ?? [],
        };
      }
    ),
  };
}
