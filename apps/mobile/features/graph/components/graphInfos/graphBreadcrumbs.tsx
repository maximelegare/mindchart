import React, { useMemo } from "react";
import { NodeDatum } from "../../types/types";
import { useRouter } from "expo-router";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { findNodePath, formatBreadcrumbLabel } from "../../utils/findNodePath";

type GraphBreadcrumbsProps = {
  hierarchy: NodeDatum;
  activeNode: NodeDatum | null;
};

export const GraphBreadcrumbs = ({
  hierarchy,
  activeNode,
}: GraphBreadcrumbsProps) => {
  const breadcrumbs = useMemo(() => {
    const targetId = activeNode?.id ?? "root";
    return findNodePath(hierarchy, targetId).map((node) => ({
      id: node.id,
      name: formatBreadcrumbLabel(node),
    }));
  }, [activeNode?.id, hierarchy]);

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
