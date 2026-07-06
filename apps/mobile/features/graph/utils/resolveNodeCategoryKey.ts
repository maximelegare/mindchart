import { CategoryKey } from "@repo/sqlite";
import { NodeDatum } from "../types/types";

export const resolveNodeCategoryKey = (
  node: NodeDatum
): CategoryKey | undefined => {
  if (node.categoryId) {
    return node.categoryId.toLowerCase() as CategoryKey;
  }

  if (node.id.startsWith("category-") && node.name) {
    return node.name.toLowerCase() as CategoryKey;
  }

  const fromChild = node.children?.[0]?.categoryId;
  if (fromChild) {
    return fromChild.toLowerCase() as CategoryKey;
  }

  return undefined;
};

export const resolveListItemCategoryShade = (
  parentNodeId: string
): number | undefined => (parentNodeId === "root" ? undefined : 50);
