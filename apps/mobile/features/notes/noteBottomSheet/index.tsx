import React, { useCallback, useMemo, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui";
import { EditNoteFeature } from "@/features/notes/editNote/views";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";
import { useControllers } from "@/api/controllers/useControllers";
import {
  FolderPickerSheet,
  FolderSelection,
} from "@/features/notes/shared/ui/folderSelector";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { EditNote } from "./components/editNote";
import { DeleteNote } from "./components/deleteNote";
import { MoveNote } from "./components/moveNote";

type NoteBottomSheetProps = {
  noteId: string;
};

export const NoteBottomSheet = ({ noteId }: NoteBottomSheetProps) => {
  const { editNoteAction } = useEditNote();
  const editSheet = useBottomSheet();
  const moveSheet = useBottomSheet();
  const [editOpen, setEditOpen] = useState(false);
  const [moveActive, setMoveActive] = useState(false);

  const { notesAndThoughts, folders } = useControllers();
  const { data: noteRows } = notesAndThoughts.useFetchNoteDetails(noteId);
  const { mutateAsync: updateNoteFolderId } =
    notesAndThoughts.useUpdateNoteFolderIdMutation();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();

  const parsedNote = useMemo(
    () => parseNoteAndThoughts(noteRows)?.[0] ?? null,
    [noteRows]
  );

  const currentFolder = useMemo((): FolderSelection => {
    const folderId = parsedNote?.folderId;
    if (!folderId || !allFolders) return null;
    return allFolders.find((folder) => folder.id === folderId) ?? null;
  }, [allFolders, parsedNote]);

  const noteTitle = useMemo(() => {
    const raw = parsedNote?.title?.trim() || "Untitled";
    return raw.length > 28 ? `${raw.slice(0, 28)}…` : raw;
  }, [parsedNote]);

  const openEditSheet = useCallback(() => {
    setEditOpen(true);
    setTimeout(() => {
      editSheet.open();
    }, 200);
  }, [editSheet]);

  const openMoveSheet = useCallback(() => {
    setMoveActive(true);
    setTimeout(() => {
      moveSheet.open();
    }, 200);
  }, [moveSheet]);

  const handleMoveSelect = useCallback(
    async (folder: FolderSelection) => {
      try {
        await updateNoteFolderId({
          noteId,
          folderId: folder?.id ?? null,
        });
      } catch (error) {
        Alert.alert("Move failed", String(error));
      } finally {
        setMoveActive(false);
      }
    },
    [noteId, updateNoteFolderId]
  );

  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <TouchableOpacity className="rounded-full flex-row items-center gap-2 w-fit">
            <Icon name="ellipsis-vertical" color="text" size={20} />
          </TouchableOpacity>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          style={{ zIndex: 100 }}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-3 pt-6 bg-background">
            <EditNote onPress={openEditSheet} />
            <MoveNote onPress={openMoveSheet} />
            <DeleteNote noteId={noteId} />
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>

      <BottomSheet>
        <BottomSheetContent
          ref={editSheet.ref}
          snapPoints={["100%"]}
          index={0}
          enableContentPanningGesture={false}
          enablePanDownToClose={false}
        >
          {editOpen ? (
            <BottomSheetView className="flex-1 gap-5 pt-6 bg-background h-full">
              <BottomSheetHeader
                className="bg-background gap-2"
                onDismiss={() => setEditOpen(false)}
              >
                <View className="flex-row justify-start items-center gap-2">
                  <Icon name="pencil" color="foreground" />
                  <Typography variant="h3">Edit Note</Typography>
                </View>
              </BottomSheetHeader>
              <EditNoteFeature
                noteId={noteId}
                setOpen={setEditOpen}
                onAction={editNoteAction}
              />
            </BottomSheetView>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>

      <FolderPickerSheet
        moveTarget={{ name: noteTitle, kind: "file" }}
        sheet={moveSheet}
        active={moveActive}
        selectedFolder={currentFolder}
        rootLabel="No folder"
        showLocationPin
        onSelect={handleMoveSelect}
        onDismiss={() => setMoveActive(false)}
      />
    </>
  );
};
