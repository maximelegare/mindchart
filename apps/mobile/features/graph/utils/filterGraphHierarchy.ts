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

const matchesTopic = (node: NodeDatum, selectedTopicId: string) => {
  const id = selectedTopicId.toLowerCase();
  if (node.topicId?.toLowerCase() === id) return true;
  if (node.id.toLowerCase() === `topic-${id}`) return true;
  if (
    node.id.toLowerCase().startsWith("topic-") &&
    node.id.toLowerCase().endsWith(`-${id}`)
  )
    return true;
  if (node.name?.toLowerCase() === id) return true;
  return false;
};

/** Use the matched topic/category node as the pack root (not the synthetic root). */
export function filterGraphHierarchy(
  hierarchy: NodeDatum,
  mode: GraphMode,
  selectedTopicId: string | null,
  selectedCategoryId: string | null
): NodeDatum {
  if (mode === "category" && selectedCategoryId) {
    const match = hierarchy.children?.find((child) =>
      matchesCategory(child, selectedCategoryId)
    );
    return match ?? hierarchy;
  }

  if (mode === "topic" && selectedTopicId) {
    const match = hierarchy.children?.find((child) =>
      matchesTopic(child, selectedTopicId)
    );
    return match ?? hierarchy;
  }

  return hierarchy;
}

export const isSyntheticRoot = (node: NodeDatum) =>
  node.id === "root" || node.name?.toLowerCase() === "root";
