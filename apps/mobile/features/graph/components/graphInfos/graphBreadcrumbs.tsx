import React, { useMemo } from "react";
import { NodeDatum } from "../../types/types";
import { useRouter } from "expo-router";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { findNodePath, formatBreadcrumbLabel } from "../../utils/findNodePath";

type GraphBreadcrumbsProps = {
  /** Visible pack hierarchy (may be window-sliced). */
  hierarchy: NodeDatum;
  /** Full filtered tree — used so folder crumbs include ancestors outside the window. */
  pathHierarchy?: NodeDatum | null;
  activeNode: NodeDatum | null;
};

export const GraphBreadcrumbs = ({
  hierarchy,
  pathHierarchy,
  activeNode,
}: GraphBreadcrumbsProps) => {
  const breadcrumbs = useMemo(() => {
    const targetId = activeNode?.id ?? "root";
    const source = pathHierarchy ?? hierarchy;
    return findNodePath(source, targetId).map((node) => ({
      id: node.id,
      name: formatBreadcrumbLabel(node),
    }));
  }, [activeNode?.id, hierarchy, pathHierarchy]);

  const { setParams } = useRouter();

  const updateGraphParams = (targetId: string) => {
    setParams({
      id: targetId,
      _t: Date.now().toString(),
    });
  };

  return (
    <Breadcrumbs
      items={breadcrumbs}
      onNavigate={updateGraphParams}
      className="mt-2 border-t border-border w-full"
    />
  );
};
