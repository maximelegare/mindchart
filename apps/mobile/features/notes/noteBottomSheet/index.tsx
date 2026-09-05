import React, { useCallback, useMemo, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetOpenTrigger,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import { noteMoveFailedAlertTitle } from "./noteBottomSheetLabels";
import {
  folderPickerNoFolderLabel,
  folderPickerNoteUntitledLabel,
} from "@/features/notes/shared/ui/folderPickerLabels";
import { useControllers } from "@/api/controllers/useControllers";
import {
  FolderPickerSheet,
  FolderSelection,
} from "@/features/notes/shared/ui/folderSelector";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { EditNote } from "./components/editNote";
import { DeleteNote } from "./components/deleteNote";
import { MoveNote } from "./components/moveNote";
import { useRouter } from "expo-router";

type NoteBottomSheetProps = {
  noteId: string;
};

export const NoteBottomSheet = ({ noteId }: NoteBottomSheetProps) => {
  const router = useRouter();
  const moveSheet = useBottomSheet();
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
    const raw = parsedNote?.title?.trim() || folderPickerNoteUntitledLabel();
    return raw.length > 28 ? `${raw.slice(0, 28)}…` : raw;
  }, [parsedNote]);

  const openEditPage = useCallback(() => {
    router.push({
      pathname: "/notes/[id]",
      params: { id: noteId, mode: "edit" },
    });
  }, [noteId, router]);

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
        Alert.alert(noteMoveFailedAlertTitle(), String(error));
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
            <EditNote onPress={openEditPage} />
            <MoveNote onPress={openMoveSheet} />
            <DeleteNote noteId={noteId} />
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>

      <FolderPickerSheet
        moveTarget={{ name: noteTitle, kind: "file" }}
        sheet={moveSheet}
        active={moveActive}
        selectedFolder={currentFolder}
        rootLabel={folderPickerNoFolderLabel()}
        showLocationPin
        onSelect={handleMoveSelect}
        onDismiss={() => setMoveActive(false)}
      />
    </>
  );
};
