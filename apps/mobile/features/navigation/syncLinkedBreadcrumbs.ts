import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { useGraphStore } from "@/features/graph/context/graphContext";
import { folderNodeId } from "@/features/graph/utils/buildGraphByFolder";
import { findNodePath } from "@/features/graph/utils/findNodePath";
import type { NodeDatum } from "@/features/graph/types/types";
import { areBreadcrumbsLinked } from "./breadcrumbLinkStore";

/** Map a notes folder id to a graph node id (root when null). */
export const graphIdFromFolderId = (folderId: string | null) =>
  folderId ? folderNodeId(folderId) : "root";

const isRootNode = (node: NodeDatum) =>
  node.id === "root" || node.name?.toLowerCase() === "root";

/**
 * Resolve a graph breadcrumb target to a notes folder id.
 * `null` = notes root; `undefined` = cannot resolve (skip sync).
 * Walks up from the target to the nearest real folder so category packs
 * and note leaves still keep notes linked.
 */
export const folderIdFromGraphTarget = (
  targetId: string,
  hierarchy: NodeDatum | null
): string | null | undefined => {
  if (targetId === "root") return null;
  if (!hierarchy) return undefined;

  const path = findNodePath(hierarchy, targetId);
  if (!path.length) return undefined;

  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    if (isRootNode(node)) return null;
    if (node.folderId && node.folderId !== "unfiled") return node.folderId;
  }

  // Category / other non-folder with no folder ancestor → notes root
  return null;
};

/** Graph breadcrumb navigated — mirror into notes when linked. */
export const onGraphBreadcrumbNavigate = (
  targetId: string,
  hierarchy: NodeDatum | null = useGraphStore.getState().breadcrumbHierarchy
) => {
  if (!areBreadcrumbsLinked()) return;
  const folderId = folderIdFromGraphTarget(targetId, hierarchy);
  if (folderId === undefined) return;

  const store = useOptionsBar.getState();
  // Linked breadcrumbs browse folders — ensure notes is in folder mode.
  if (store.foldersMode !== "with") {
    store.handleFoldersModeChange("with");
  }
  store.handleCurrentFolderChange(folderId);
};
