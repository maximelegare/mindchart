import { NodeDatum } from "../types/types";

/** Visible levels under the window root (root + 3 = 4 total). */
export const MAX_FOLDER_WINDOW_DEPTH = 3;

const isThoughtLeaf = (node: NodeDatum) => !!node.thoughtId;

const isFolderNode = (node: NodeDatum) =>
  !!node.folderId || node.id.startsWith("folder-");

export const findNodeById = (root: NodeDatum, id: string): NodeDatum | null => {
  if (root.id === id) return root;
  if (root.folderId && `folder-${root.folderId}` === id) return root;
  if (root.folderId === id) return root;

  for (const child of root.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

export const findParentFolderId = (
  root: NodeDatum,
  folderId: string | null
): string | null => {
  if (!folderId) return null;

  const walk = (
    node: NodeDatum,
    parentFolderId: string | null
  ): string | null | undefined => {
    if (node.folderId === folderId || node.id === `folder-${folderId}`) {
      return parentFolderId;
    }
    for (const child of node.children ?? []) {
      const found = walk(child, node.folderId ?? parentFolderId);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  return walk(root, null) ?? null;
};

const truncateAtDepth = (
  node: NodeDatum,
  depth: number,
  maxDepth: number
): NodeDatum => {
  const children = node.children ?? [];
  if (!children.length) {
    return { ...node, hasHiddenChildren: false };
  }

  if (depth >= maxDepth) {
    const thoughts = children.filter(isThoughtLeaf);
    const nestedFolders = children.filter((child) => !isThoughtLeaf(child));
    const hasHiddenChildren = nestedFolders.length > 0;

    if (thoughts.length > 0) {
      return {
        ...node,
        children: thoughts,
        hasHiddenChildren,
      };
    }

    // Keep the node packable when only deeper folders exist.
    return {
      ...node,
      children: undefined,
      value: node.value ?? Math.max(nestedFolders.length, 1),
      hasHiddenChildren,
    };
  }

  return {
    ...node,
    hasHiddenChildren: false,
    children: children.map((child) => {
      if (isThoughtLeaf(child)) return { ...child, hasHiddenChildren: false };
      return truncateAtDepth(child, depth + 1, maxDepth);
    }),
  };
};

/**
 * Slice the folder tree so only `maxDepth` levels under the window root are
 * visible. Folders with deeper children get `hasHiddenChildren`.
 */
export const sliceFolderWindow = (
  fullRoot: NodeDatum,
  windowRootId: string | null,
  maxDepth = MAX_FOLDER_WINDOW_DEPTH
): NodeDatum => {
  const windowRoot = windowRootId
    ? (findNodeById(fullRoot, windowRootId) ??
      findNodeById(fullRoot, `folder-${windowRootId}`) ??
      fullRoot)
    : fullRoot;

  // When focusing a folder as the pack root, wrap so breadcrumbs/zoom still
  // treat it as the outer shell (depth 0).
  if (windowRootId && windowRoot.id !== "root") {
    return truncateAtDepth(
      {
        ...windowRoot,
        // Ensure the focused folder is the layout root.
      },
      0,
      maxDepth
    );
  }

  return truncateAtDepth(windowRoot, 0, maxDepth);
};

export const nodeHasHiddenChildren = (node: NodeDatum) =>
  !!node.hasHiddenChildren && isFolderNode(node);
