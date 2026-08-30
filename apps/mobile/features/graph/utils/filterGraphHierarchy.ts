import { GraphMode, NodeDatum } from "../types/types";

const matchesCategory = (node: NodeDatum, selectedCategoryId: string) => {
  const id = selectedCategoryId.toLowerCase();
  if (node.categoryId?.toLowerCase() === id) return true;
  if (node.id.toLowerCase() === `category-${id}`) return true;
  if (
    node.id.toLowerCase().endsWith(`-${id}`) &&
    node.id.startsWith("category-")
  )
    return true;
  if (node.name?.toLowerCase() === id) return true;
  return false;
};

const matchesFolder = (node: NodeDatum, selectedFolderId: string) => {
  const id = selectedFolderId.toLowerCase();
  if (node.folderId?.toLowerCase() === id) return true;
  if (node.id.toLowerCase() === `folder-${id}`) return true;
  if (node.name?.toLowerCase() === id) return true;
  return false;
};

function findMatchingNode(
  node: NodeDatum,
  matches: (candidate: NodeDatum) => boolean
): NodeDatum | null {
  if (matches(node)) return node;
  for (const child of node.children ?? []) {
    const found = findMatchingNode(child, matches);
    if (found) return found;
  }
  return null;
}

/** Use the matched folder/category node as the pack root (not the synthetic root). */
export function filterGraphHierarchy(
  hierarchy: NodeDatum,
  mode: GraphMode,
  selectedFolderId: string | null,
  selectedCategoryId: string | null
): NodeDatum {
  if (mode === "category" && selectedCategoryId) {
    const match = findMatchingNode(hierarchy, (node) =>
      matchesCategory(node, selectedCategoryId)
    );
    return match ?? hierarchy;
  }

  if (mode === "folder" && selectedFolderId) {
    const match = findMatchingNode(hierarchy, (node) =>
      matchesFolder(node, selectedFolderId)
    );
    return match ?? hierarchy;
  }

  return hierarchy;
}

export const isSyntheticRoot = (node: NodeDatum) =>
  node.id === "root" || node.name?.toLowerCase() === "root";
