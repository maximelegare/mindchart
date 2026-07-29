import { CategoryKey } from "@repo/sqlite";
import { NodeDatum } from "../types/types";

const asCategoryKey = (value: string | undefined): CategoryKey | undefined =>
  value ? (value.toLowerCase() as CategoryKey) : undefined;

/** Walk descendants until a categoryId is found (nested folders often omit it). */
const findCategoryIdInTree = (node: NodeDatum): CategoryKey | undefined => {
  const own = asCategoryKey(node.categoryId);
  if (own) return own;
  for (const child of node.children ?? []) {
    const found = findCategoryIdInTree(child);
    if (found) return found;
  }
  return undefined;
};

export const resolveNodeCategoryKey = (
  node: NodeDatum
): CategoryKey | undefined => {
  const own = asCategoryKey(node.categoryId);
  if (own) return own;

  if (node.id.startsWith("category-") && node.name) {
    return asCategoryKey(node.name);
  }

  return findCategoryIdInTree(node);
};

export const resolveListItemCategoryShade = (
  parentNodeId: string
): number | undefined => (parentNodeId === "root" ? undefined : 50);
