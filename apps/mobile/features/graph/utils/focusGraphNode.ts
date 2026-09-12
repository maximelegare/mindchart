import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
import type { ScrollToTopOptions } from "@/components/layout/page/pageContainer";
import { useGraphStore } from "../context/graphContext";
import type { NodeDatum } from "../types/types";

type GraphParams = { id: string; _t: string };
type GraphScrollToTop = (options?: ScrollToTopOptions) => boolean;

let scrollGraphPageToTop: GraphScrollToTop | null = null;
let scrollGraphInfosToTop: GraphScrollToTop | null = null;
let pendingFocus: ReturnType<typeof setTimeout> | null = null;

/** Page-level scroll (tabs + canvas). Registered by the graph screen. */
export function setGraphPageScrollToTop(fn: GraphScrollToTop | null) {
  scrollGraphPageToTop = fn;
}

/** Infos list under the canvas. Registered by GraphInfos. */
export function setGraphInfosScrollToTop(fn: GraphScrollToTop | null) {
  scrollGraphInfosToTop = fn;
}

const applyGraphFocus = (
  nodeId: string,
  setParams: (params: GraphParams) => void,
  hierarchy?: NodeDatum | null
) => {
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
};

/**
 * Scroll the page to the tabs first, then zoom. Graph motion is fast enough
 * that zooming while still looking at infos feels like a jump.
 */
export function navigateGraphSelection(
  nodeId: string,
  setParams: (params: GraphParams) => void,
  hierarchy?: NodeDatum | null
) {
  if (pendingFocus) {
    clearTimeout(pendingFocus);
    pendingFocus = null;
  }

  const pageWasScrolled = scrollGraphPageToTop?.({ animated: true }) ?? false;
  scrollGraphInfosToTop?.({ animated: true });

  const run = () => {
    pendingFocus = null;
    applyGraphFocus(nodeId, setParams, hierarchy);
  };

  if (pageWasScrolled) {
    pendingFocus = setTimeout(run, 340);
    return;
  }

  run();
}
