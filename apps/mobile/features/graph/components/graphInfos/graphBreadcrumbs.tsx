import React, { useMemo } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { BreadcrumbCrumb, Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useControllers } from "@/api/controllers/useControllers";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FolderBreadcrumbCrumb } from "@/features/contentList/features/folderContents/components/folderActionsMenu";
import { folderBreadcrumbRootLabel } from "@/features/notes/shared/ui/folderPickerLabels";
import {
  folderIdFromGraphTarget,
  onGraphBreadcrumbNavigate,
} from "@/features/navigation/syncLinkedBreadcrumbs";
import { useGraphStore } from "../../context/graphContext";
import { findNodePath, formatBreadcrumbLabel } from "../../utils/findNodePath";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";

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
  const graphMode = useGraphStore((s) => s.mode);
  const { setParams } = useRouter();
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: graphMode === "folder",
  });
  const categoryLabels = useCategoryLabelsMap();

  const foldersById = useMemo(
    () => new Map(allFolders.map((folder) => [folder.id, folder])),
    [allFolders]
  );

  const rootLabel = folderBreadcrumbRootLabel();

  const breadcrumbs = useMemo(() => {
    if (!hierarchy) return [{ id: "root", name: rootLabel }];
    const targetId = activeId ?? hierarchy.id ?? "root";
    const path = findNodePath(hierarchy, targetId).map((node, index) => {
      const isSynthetic =
        index === 0 &&
        (node.id === "root" || node.name?.toLowerCase() === "root");
      return {
        id: isSynthetic ? "root" : node.id,
        name: isSynthetic
          ? rootLabel
          : formatBreadcrumbLabel(node, categoryLabels),
      };
    });
    return path.length > 0 ? path : [{ id: "root", name: rootLabel }];
  }, [activeId, categoryLabels, hierarchy, rootLabel]);

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
        renderItem={({ item, isLast }) => {
          if (graphMode !== "folder") {
            return (
              <BreadcrumbCrumb
                item={item}
                isLast={isLast}
                onNavigate={updateGraphParams}
              />
            );
          }

          const folderId =
            item.id === "root"
              ? null
              : folderIdFromGraphTarget(item.id, hierarchy);
          const folder =
            typeof folderId === "string"
              ? (foldersById.get(folderId) ?? null)
              : null;

          return (
            <FolderBreadcrumbCrumb
              item={item}
              isLast={isLast}
              folder={folder}
              onNavigate={updateGraphParams}
            />
          );
        }}
      />
    </BreadcrumbsSurface>
  );
};
