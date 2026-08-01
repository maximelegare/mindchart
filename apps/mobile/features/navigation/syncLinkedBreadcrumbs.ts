import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useGraphStore } from "@/features/graph/context/graphContext";
import { folderNodeId } from "@/features/graph/utils/buildGraphByFolder";
import { findNodePath } from "@/features/graph/utils/findNodePath";
import type { NodeDatum } from "@/features/graph/types/types";
import { areBreadcrumbsLinked } from "./breadcrumbLinkStore";

/** Map a notes folder id to a graph node id (root when null). */
export const graphIdFromFolderId = (folderId: string | null) =>
  folderId ? folderNodeId(folderId) : "root";

/**
 * Resolve a graph breadcrumb target to a notes folder id.
 * `null` = root; `undefined` = not a folder target (skip sync).
 */
export const folderIdFromGraphTarget = (
  targetId: string,
  hierarchy: NodeDatum | null
): string | null | undefined => {
  if (targetId === "root") return null;
  if (!hierarchy) return undefined;
  if (targetId === hierarchy.id) return null;

  const path = findNodePath(hierarchy, targetId);
  const node = path[path.length - 1];
  if (!node) return undefined;
  if (node.id === "root" || node.name?.toLowerCase() === "root") return null;
  if (node.folderId) return node.folderId;
  return undefined;
};

/** Graph breadcrumb navigated — mirror into notes when it's a folder path. */
export const onGraphBreadcrumbNavigate = (
  targetId: string,
  hierarchy: NodeDatum | null = useGraphStore.getState().breadcrumbHierarchy
) => {
  if (!areBreadcrumbsLinked()) return;
  const folderId = folderIdFromGraphTarget(targetId, hierarchy);
  if (folderId === undefined) return;
  useOptionsBar.getState().handleCurrentFolderChange(folderId);
};
