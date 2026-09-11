import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
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
import { useModal } from "@/components/ui/modal/modal";
import { useControllers } from "@/api/controllers/useControllers";
import {
  noteDeleteFailedAlertTitle,
  noteMoveFailedAlertTitle,
} from "@/features/notes/noteBottomSheet/noteBottomSheetLabels";
import {
  FolderPickerSheet,
  type FolderSelection,
} from "@/features/notes/shared/ui/folderSelector";
import type { FolderTreeFile } from "./folderTreeUtils";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";

type FileActionsMenuProps = {
  file: FolderTreeFile;
  onNavigate?: () => void;
  onCloseSidebar?: () => void;
  children: React.ReactNode;
  className?: string;
  /** Extra press area; avoid when a sibling control sits beside this. */
  hitSlop?: number;
};

export function FileActionsMenu({
  file,
  onNavigate,
  onCloseSidebar,
  children,
  className,
  hitSlop = 8,
}: FileActionsMenuProps) {
  const router = useRouter();
  const actionsSheet = useBottomSheet();
  const moveSheet = useBottomSheet();
  const [moveActive, setMoveActive] = useState(false);
  const [sheetsMounted, setSheetsMounted] = useState(false);
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();
  const { notesAndThoughts, folders } = useControllers();
  const { mutateAsync: updateNoteFolderId } =
    notesAndThoughts.useUpdateNoteFolderIdMutation();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: sheetsMounted,
  });

  const currentFolder = useMemo((): FolderSelection => {
    if (!file.folderId) return null;
    return allFolders.find((folder) => folder.id === file.folderId) ?? null;
  }, [allFolders, file.folderId]);

  const rawTitle = file.title?.trim() || "Untitled";
  const title = rawTitle.length > 28 ? `${rawTitle.slice(0, 28)}…` : rawTitle;

  const closeActions = useCallback(() => {
    actionsSheet.close();
  }, [actionsSheet]);

  const openNote = useCallback(
    (mode?: "edit") => {
      closeActions();
      onCloseSidebar?.();
      router.push({
        pathname: "/notes/[id]",
        params: mode ? { id: file.id, mode } : { id: file.id },
      });
    },
    [closeActions, file.id, onCloseSidebar, router]
  );

  const openMoveSheet = useCallback(() => {
    closeActions();
    setMoveActive(true);
    setTimeout(() => {
      moveSheet.open();
    }, 200);
  }, [closeActions, moveSheet]);

  const handleMoveSelect = useCallback(
    async (folder: FolderSelection) => {
      if (!folder) {
        Alert.alert(
          "Folder required",
          "Notes must be saved in a folder. Root is not allowed."
        );
        return;
      }
      try {
        await updateNoteFolderId({
          noteId: file.id,
          folderId: folder.id,
        });
      } catch (error) {
        Alert.alert(noteMoveFailedAlertTitle(), String(error));
      } finally {
        setMoveActive(false);
      }
    },
    [file.id, updateNoteFolderId]
  );

  const openDeleteConfirmation = useCallback(() => {
    closeActions();
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm: async () => {
        try {
          await deleteNoteAction(file.id);
          closeModal();
        } catch (error) {
          Alert.alert(noteDeleteFailedAlertTitle(), String(error));
        }
      },
    });
  }, [closeActions, closeModal, deleteNoteAction, file.id, openModal]);

  const openActions = useCallback(() => {
    if (!sheetsMounted) {
      setSheetsMounted(true);
      return;
    }
    actionsSheet.open();
  }, [actionsSheet, sheetsMounted]);

  useEffect(() => {
    // `actionsSheet` is a new object each render; `open` itself is stable.
    if (sheetsMounted) actionsSheet.open();
  }, [sheetsMounted]);

  return (
    <>
      <Pressable
        onPress={() => onNavigate?.()}
        onLongPress={openActions}
        delayLongPress={400}
        className={cn("shrink-0", className)}
        style={hitSlop ? { margin: -hitSlop, padding: hitSlop } : undefined}
      >
        {children}
      </Pressable>

      {sheetsMounted ? (
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
                  <Icon name="notebook-text" color="foreground" size={18} />
                  <Typography variant="h3" numberOfLines={1}>
                    {title}
                  </Typography>
                </View>
              </BottomSheetHeader>

              <Button
                variant="outline"
                size="default"
                onPress={() => openNote()}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="eye" color="foreground" size={18} />
                  <Typography variant="h3">View</Typography>
                </View>
              </Button>

              <Button
                variant="outline"
                size="default"
                onPress={() => openNote("edit")}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="pencil" color="foreground" size={18} />
                  <Typography variant="h3">Edit</Typography>
                </View>
              </Button>

              <Button variant="outline" size="default" onPress={openMoveSheet}>
                <View className="flex-row items-center gap-2">
                  <Icon name="arrow-right-left" color="foreground" size={18} />
                  <Typography variant="h3">Move</Typography>
                </View>
              </Button>

              <Button
                variant="destructive"
                size="default"
                onPress={openDeleteConfirmation}
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
            </BottomSheetView>
          </BottomSheetContent>
        </BottomSheet>
      ) : null}

      {sheetsMounted ? (
        <FolderPickerSheet
          moveTarget={{ name: title, kind: "file" }}
          sheet={moveSheet}
          active={moveActive}
          selectedFolder={currentFolder}
          allowRoot={false}
          showLocationPin
          onSelect={handleMoveSelect}
          onDismiss={() => setMoveActive(false)}
        />
      ) : null}
    </>
  );
}
