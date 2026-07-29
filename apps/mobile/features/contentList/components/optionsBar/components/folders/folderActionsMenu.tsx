import React, { useCallback, useMemo } from "react";
import { Alert, Pressable, View } from "react-native";
import { canCreateChildFolder, canMoveFolderTo } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import {
  FolderPickerSheet,
  FolderSelection,
} from "@/features/notes/notePreview/folderSelector";
import { useControllers } from "@/api/controllers/useControllers";
import { useFolderActions } from "../../hooks/useFolderActions";

export type FolderActionsTarget =
  | { kind: "root" }
  | { kind: "folder"; folder: Folder };

type FolderActionsMenuProps = {
  target: FolderActionsTarget;
  onNavigate?: () => void;
  children: React.ReactNode;
  className?: string;
};

export const FolderActionsMenu = ({
  target,
  onNavigate,
  children,
  className,
}: FolderActionsMenuProps) => {
  const actionsSheet = useBottomSheet();
  const moveSheet = useBottomSheet();
  const [moveActive, setMoveActive] = React.useState(false);
  const {
    openCreateFolderModal,
    openRenameFolderModal,
    openDeleteFolderModal,
    getFolderParent,
    moveFolderTo,
  } = useFolderActions();

  const isRoot = target.kind === "root";
  const movingFolder = target.kind === "folder" ? target.folder : null;
  const canCreateHere = canCreateChildFolder(
    target.kind === "root" ? null : target.folder.path
  );
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery();
  const allPaths = useMemo(
    () => allFolders.map((folder) => folder.path),
    [allFolders]
  );

  const title =
    target.kind === "root" ? "Root" : target.folder.label || "Folder";

  const closeActions = useCallback(() => {
    actionsSheet.close();
  }, [actionsSheet]);

  const openMoveSheet = useCallback(() => {
    closeActions();
    setMoveActive(true);
    setTimeout(() => {
      moveSheet.open();
    }, 200);
  }, [closeActions, moveSheet]);

  const handleMoveSelect = useCallback(
    async (destination: FolderSelection) => {
      if (!movingFolder) return;
      try {
        await moveFolderTo(movingFolder, destination);
      } catch (error) {
        Alert.alert("Move failed", String(error));
      } finally {
        setMoveActive(false);
      }
    },
    [moveFolderTo, movingFolder]
  );

  const isMoveDestinationEnabled = useCallback(
    (destination: FolderSelection) => {
      if (!movingFolder) return true;
      return canMoveFolderTo(
        movingFolder.path,
        destination?.path ?? null,
        allPaths
      );
    },
    [allPaths, movingFolder]
  );

  const movingFolderParent = movingFolder
    ? getFolderParent(movingFolder)
    : null;
  const movingFolderTitle = (() => {
    if (!movingFolder) return "Folder";
    const raw = movingFolder.label?.trim() || "Folder";
    return raw.length > 28 ? `${raw.slice(0, 28)}…` : raw;
  })();

  return (
    <>
      <Pressable
        onPress={() => onNavigate?.()}
        onLongPress={() => actionsSheet.open()}
        delayLongPress={400}
        className={cn("shrink-0", className)}
        hitSlop={8}
      >
        {children}
      </Pressable>

      <BottomSheet>
        <BottomSheetContent
          ref={actionsSheet.ref}
          style={{ zIndex: 200 }}
          enablePanDownToClose
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-3 pt-4 bg-background">
            <BottomSheetHeader
              className="bg-background"
              onDismiss={closeActions}
            >
              <View className="flex-row items-center gap-2">
                <Icon
                  name={isRoot ? "house" : "folder"}
                  color="foreground"
                  size={18}
                />
                <Typography variant="h3" numberOfLines={1}>
                  {title}
                </Typography>
              </View>
            </BottomSheetHeader>

            {canCreateHere ? (
              <Button
                variant="outline"
                size="default"
                onPress={() => {
                  closeActions();
                  openCreateFolderModal(target);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="folder" color="foreground" size={18} />
                  <Typography variant="h3">New folder</Typography>
                </View>
              </Button>
            ) : null}

            {!isRoot && target.kind === "folder" ? (
              <>
                <Button
                  variant="outline"
                  size="default"
                  onPress={() => {
                    closeActions();
                    openRenameFolderModal(target.folder);
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <Icon name="pencil" color="foreground" size={18} />
                    <Typography variant="h3">Rename</Typography>
                  </View>
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  onPress={openMoveSheet}
                >
                  <View className="flex-row items-center gap-2">
                    <Icon
                      name="arrow-right-left"
                      color="foreground"
                      size={18}
                    />
                    <Typography variant="h3">Move</Typography>
                  </View>
                </Button>
                <Button
                  variant="destructive"
                  size="default"
                  onPress={() => {
                    closeActions();
                    openDeleteFolderModal(target.folder);
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <Icon
                      name="trash-2"
                      color="destructive-foreground"
                      size={18}
                    />
                    <Typography variant="h3">Delete</Typography>
                  </View>
                </Button>
              </>
            ) : null}
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>

      {movingFolder ? (
        <FolderPickerSheet
          title={`Move "${movingFolderTitle}" to…`}
          sheet={moveSheet}
          active={moveActive}
          selectedFolder={movingFolderParent}
          excludePathPrefix={movingFolder.path}
          rootLabel="Move to root"
          showLocationPin
          onSelect={handleMoveSelect}
          onDismiss={() => setMoveActive(false)}
          isDestinationEnabled={isMoveDestinationEnabled}
        />
      ) : null}
    </>
  );
};

type FolderBreadcrumbCrumbProps = {
  item: { id: string; name: string };
  isLast: boolean;
  folder: Folder | null;
  onNavigate: (id: string) => void;
};

export const FolderBreadcrumbCrumb = ({
  item,
  isLast,
  folder,
  onNavigate,
}: FolderBreadcrumbCrumbProps) => {
  const isRoot = item.id === "root" || item.id === "Root";
  const target: FolderActionsTarget =
    isRoot || !folder
      ? ({ kind: "root" } as const)
      : ({ kind: "folder", folder } as const);

  return (
    <View className="flex-row items-center shrink-0" collapsable={false}>
      <FolderActionsMenu target={target} onNavigate={() => onNavigate(item.id)}>
        <View
          pointerEvents="box-only"
          className={cn(
            "h-10 justify-center opacity-50 px-1",
            isLast ? "opacity-100" : ""
          )}
        >
          {isRoot ? (
            <Icon name="house" color="text" size={18} />
          ) : (
            <Typography variant="h5" numberOfLines={1}>
              {item.name}
            </Typography>
          )}
        </View>
      </FolderActionsMenu>
      {!isLast && (
        <Typography
          variant="p"
          className="opacity-50"
          style={{ marginHorizontal: 2 }}
        >
          /
        </Typography>
      )}
    </View>
  );
};
