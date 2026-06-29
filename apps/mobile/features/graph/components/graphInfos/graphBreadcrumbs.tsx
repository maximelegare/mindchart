import React, { useMemo } from "react";
import { NodeDatum } from "../../types/types";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";
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

  const handleZoom = (breadcrumb: { id: string; name: string }) => {
    updateGraphParams(breadcrumb.id);
  };

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      updateGraphParams(breadcrumbs[breadcrumbs.length - 2].id);
    }
  };

  return (
    <View className="mb-3 mx-2 gap-1 rounded-md bg-muted border-input border">
      <View className="flex-row items-center min-h-10">
        <TouchableOpacity
          disabled={breadcrumbs.length <= 1}
          onPress={handleGoBack}
          className={cn(
            "h-10 w-8 shrink-0 bg-input rounded-sm items-center justify-center",
            breadcrumbs.length <= 1 ? "opacity-50" : ""
          )}
        >
          <Icon
            name="chevron-left"
            color="text"
            opacity={breadcrumbs.length <= 1 ? 50 : 100}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexGrow: 1,
          }}
          className="flex-1"
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <View
              key={breadcrumb.id}
              className="flex-row items-center shrink-0"
            >
              {index > 0 && (
                <Typography variant="p" className="mx-1 opacity-50">
                  /
                </Typography>
              )}
              <Button
                variant="ghost"
                size="xs"
                className={cn(
                  "opacity-50 shrink-0",
                  index === breadcrumbs.length - 1 ? "opacity-100" : ""
                )}
                onPress={() => handleZoom(breadcrumb)}
              >
                <Typography variant="h3" numberOfLines={1}>
                  {breadcrumb.name}
                </Typography>
              </Button>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
