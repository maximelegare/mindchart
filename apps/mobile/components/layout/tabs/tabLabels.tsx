import { fbs } from "fbtee";
import type { ReactNode } from "react";

export function NotesTabLabel() {
  return <fbt desc="Tab bar label: notes">Notes</fbt>;
}

export function GraphTabLabel() {
  return <fbt desc="Tab bar label: graph">Graph</fbt>;
}

export function getTabLabel(routeName: string): ReactNode {
  switch (routeName) {
    case "notes":
      return <NotesTabLabel />;
    case "graph":
      return <GraphTabLabel />;
    default:
      return routeName;
  }
}

export function getTabAccessibilityLabel(routeName: string): string {
  switch (routeName) {
    case "notes":
      return fbs("Notes", "Tab bar accessibility label: notes");
    case "graph":
      return fbs("Graph", "Tab bar accessibility label: graph");
    default:
      return routeName;
  }
}

export function tabPageFallbackTitle() {
  return fbs("Page", "Tab header fallback title");
}
