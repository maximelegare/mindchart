import { NodeDatum } from "../types/types";

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

export const formatBreadcrumbLabel = (node: NodeDatum) => {
  if (node.id === "root") return "Root";
  const label = node.folderLabel || node.name || node.title || node.id;
  return label.charAt(0).toUpperCase() + label.slice(1);
};
