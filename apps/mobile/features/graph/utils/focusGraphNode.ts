import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
import { useGraphStore } from "../context/graphContext";
import type { NodeDatum } from "../types/types";

type GraphParams = { id: string; _t: string };

/**
 * Zoom the live graph immediately, then keep the route param in sync.
 * Infos/breadcrumbs used to wait on `setParams` → `useEffect` before moving
 * the camera; that lag grows with graph size. Graph taps already call
 * `navigateToNode` directly — this is the same path.
 */
export function navigateGraphSelection(
  nodeId: string,
  setParams: (params: GraphParams) => void,
  hierarchy?: NodeDatum | null
) {
  const focus = useGraphStore.getState().focusGraphNode;
  const params = {
    id: nodeId,
    _t: Date.now().toString(),
  };

  if (focus) {
    focus(nodeId);
    requestAnimationFrame(() => setParams(params));
  } else {
    setParams(params);
  }

  queueMicrotask(() => onGraphBreadcrumbNavigate(nodeId, hierarchy));
}
