import React, { useMemo } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { BreadcrumbCrumb, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
import { useGraphStore } from "../../context/graphContext";
import { findNodePath, formatBreadcrumbLabel } from "../../utils/findNodePath";

function BreadcrumbsSurface({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const backgroundColor = hsl("card", colorScheme);

  return (
    <View
      className="min-w-0 overflow-hidden flex-1 flex-row items-center rounded-full"
      style={{ backgroundColor }}
    >
      {children}
    </View>
  );
}

export const GraphBreadcrumbs = () => {
  const hierarchy = useGraphStore((s) => s.breadcrumbHierarchy);
  const activeId = useGraphStore((s) => s.breadcrumbActiveId);
  const { setParams } = useRouter();

  const breadcrumbs = useMemo(() => {
    if (!hierarchy) return [{ id: "root", name: "Root" }];
    const targetId = activeId ?? hierarchy.id ?? "root";
    const path = findNodePath(hierarchy, targetId).map((node, index) => {
      const isSynthetic =
        index === 0 &&
        (node.id === "root" || node.name?.toLowerCase() === "root");
      return {
        id: isSynthetic ? "root" : node.id,
        name: isSynthetic ? "Root" : formatBreadcrumbLabel(node),
      };
    });
    return path.length > 0 ? path : [{ id: "root", name: "Root" }];
  }, [activeId, hierarchy]);

  const updateGraphParams = (targetId: string) => {
    setParams({
      id: targetId,
      _t: Date.now().toString(),
    });
    onGraphBreadcrumbNavigate(targetId, hierarchy);
  };

  return (
    <BreadcrumbsSurface>
      <Breadcrumbs
        items={breadcrumbs}
        onNavigate={updateGraphParams}
        renderItem={({ item, isLast }) => (
          <BreadcrumbCrumb
            item={item}
            isLast={isLast}
            onNavigate={updateGraphParams}
          />
        )}
      />
    </BreadcrumbsSurface>
  );
};
