import React, { useMemo } from "react";
import { NodeDatum } from "../../types/types";
import { TouchableOpacity, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";

type GraphBreadcrumbsProps = {
  activeNode: NodeDatum | null;
  parentNode: NodeDatum | null;
};

export const GraphBreadcrumbs = ({
  activeNode,
  parentNode,
}: GraphBreadcrumbsProps) => {
  const breadcrumbs = useMemo(() => {
    const items: Array<{ id: string; name: string }> = [
      { id: "root", name: "Root" },
    ];
    if (parentNode && parentNode.id !== "root") {
      items.push({ id: parentNode.id, name: parentNode.name });
    }
    if (
      activeNode &&
      activeNode.id !== parentNode?.id &&
      activeNode.id !== "root"
    ) {
      items.push({ id: activeNode.id, name: activeNode.name });
    }
    return items;
  }, [activeNode, parentNode]);

  const { setParams } = useRouter();

  const handleZoom = (breadcrumb: { id: string; name: string }) => {
    const targetId = breadcrumb.id;
    setParams({
      id: targetId,
      _t: Date.now().toString(),
    });
  };

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      setParams({
        id: breadcrumbs[breadcrumbs.length - 2].id,
        _t: Date.now().toString(),
      });
    }
  };

  return (
    <View className="mb-3 m-2 gap-1 rounded-md bg-muted w-fit border-input border">
      <View className="flex-row flex-wrap items-center gap-1 h-10 relative overflow-hidden">
        <TouchableOpacity
          disabled={breadcrumbs.length <= 1}
          onPress={handleGoBack}
          className={cn(
            "h-full w-8 bg-input rounded-sm items-center justify-center",
            breadcrumbs.length <= 1 ? "opacity-50" : ""
          )}
        >
          <Icon
            name="chevron-left"
            color="text"
            opacity={breadcrumbs.length <= 1 ? 50 : 100}
          />
        </TouchableOpacity>
        <View className="flex-row flex-wrap items-center gap-1 ml-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <View
              className="flex-row flex-wrap items-center gap-1"
              key={breadcrumb.id}
            >
              <React.Fragment key={breadcrumb.id}>
                {index > 0 && (
                  <Typography variant="p" className="ml-1 opacity-50">
                    /
                  </Typography>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  className={cn(
                    "opacity-50",
                    index === breadcrumbs.length - 1 ? "opacity-100" : ""
                  )}
                  onPress={() => handleZoom(breadcrumb)}
                >
                  <Typography variant="h3" className={cn("ml-1")}>
                    {breadcrumb.name.charAt(0).toUpperCase() +
                      breadcrumb.name.slice(1)}
                  </Typography>
                </Button>
              </React.Fragment>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
