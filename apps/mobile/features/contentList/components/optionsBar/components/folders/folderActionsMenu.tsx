import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { canCreateChildFolder, canMoveFolderTo } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useBottomSheet } from "@/components/primitives/bottomSheet/bottom-sheet.native";
import {
  FolderPickerSheet,
  FolderSelection,
} from "@/features/notes/notePreview/folderSelector";
import { useControllers } from "@/api/controllers/useControllers";
import { useFolderActions } from "../../hooks/useFolderActions";

type FolderActionsMenuProps = {
  /** Root target or a real folder */
  target: { kind: "root" } | { kind: "folder"; folder: Folder };
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
  const [open, setOpen] = useState(false);
  const [moveActive, setMoveActive] = useState(false);
  const moveSheet = useBottomSheet();
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

  const openMoveSheet = useCallback(() => {
    setOpen(false);
    setMoveActive(true);
    setTimeout(() => {
      moveSheet.open();
    }, 200);
  }, [moveSheet]);

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

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild openOnLongPress>
          <Pressable
            onPress={() => onNavigate?.()}
            className={cn("shrink-0", className)}
            hitSlop={8}
          >
            {children}
          </Pressable>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          className="border border-border bg-popover shadow-md"
          style={{ minWidth: 160, marginTop: 4 }}
        >
          {canCreateHere ? (
            <DropdownMenuItem
              className="flex-row items-center gap-2"
              onPress={() => {
                setOpen(false);
                openCreateFolderModal(target);
              }}
            >
              <Icon name="folder" color="text" size={16} />
              <Typography
                variant="p"
                className="text-md text-popover-foreground"
              >
                New folder
              </Typography>
            </DropdownMenuItem>
          ) : null}

          {!isRoot && target.kind === "folder" ? (
            <>
              <DropdownMenuItem
                className="flex-row items-center gap-2"
                onPress={() => {
                  setOpen(false);
                  openRenameFolderModal(target.folder);
                }}
              >
                <Icon name="pencil" color="text" size={16} />
                <Typography
                  variant="p"
                  className="text-md text-popover-foreground"
                >
                  Rename
                </Typography>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex-row items-center gap-2"
                onPress={openMoveSheet}
              >
                <Icon name="arrow-right-left" color="text" size={16} />
                <Typography
                  variant="p"
                  className="text-md text-popover-foreground"
                >
                  Move
                </Typography>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex-row items-center gap-2"
                onPress={() => {
                  setOpen(false);
                  openDeleteFolderModal(target.folder);
                }}
              >
                <Icon name="trash-2" color="destructive-foreground" size={16} />
                <Typography
                  variant="p"
                  className="text-md text-destructive-foreground"
                >
                  Delete
                </Typography>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {movingFolder ? (
        <FolderPickerSheet
          title="Move folder to…"
          sheet={moveSheet}
          active={moveActive}
          selectedFolder={getFolderParent(movingFolder)}
          excludePathPrefix={movingFolder.path}
          rootLabel="Move to root"
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
  const isRoot = item.id === "root";
  const target =
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
