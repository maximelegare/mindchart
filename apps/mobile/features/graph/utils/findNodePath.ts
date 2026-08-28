import { NodeDatum } from "../types/types";

const isCategoryNodeId = (id: string) => id.startsWith("category-");

export const findNodePath = (
  root: NodeDatum,
  targetId: string
): NodeDatum[] => {
  if (targetId === "root") {
    return [root];
  }

  const path: NodeDatum[] = [];

  const walk = (node: NodeDatum, trail: NodeDatum[]): boolean => {
    const nextTrail = [...trail, node];
    if (node.id === targetId) {
      path.push(...nextTrail);
      return true;
    }
    for (const child of node.children ?? []) {
      if (walk(child, nextTrail)) return true;
    }
    return false;
  };

  walk(root, []);
  return path.length > 0 ? path : [root];
};

export const formatBreadcrumbLabel = (
  node: NodeDatum,
  categoryLabels?: Map<string, string>
) => {
  if (node.id === "root") return "Root";
  const rawLabel = node.folderLabel || node.name || node.title || node.id;
  const label =
    categoryLabels && isCategoryNodeId(node.id) && node.name
      ? (categoryLabels.get(node.name) ?? rawLabel)
      : rawLabel;
  return label.charAt(0).toUpperCase() + label.slice(1);
};
