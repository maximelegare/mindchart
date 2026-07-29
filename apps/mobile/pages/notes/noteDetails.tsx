import { PageContainer } from "@/components/layout/page/pageContainer";
import { useModal } from "@/components/ui/modal/modal";
import { useControllers } from "@/api/controllers/useControllers";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { EditNoteButton } from "@/features/notes/editNote/components/editNoteButton";
import { DiscardNoteButton } from "@/features/notes/noteDetails/components/discardNoteButton";
import { NoteDetailsOptionsHeader } from "@/features/notes/noteDetails/components/noteDetailsOptionsHeader";
import { useNoteDetailsData } from "@/features/notes/noteDetails/hooks/useNoteDetailsData";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import type { NoteEditorMode } from "@/features/notes/noteDetails/types";
import type { FolderSelection } from "@/features/notes/notePreview/folderSelector";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

function parseEditorMode(value: string | string[] | undefined): NoteEditorMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "preview" ? "preview" : "regular";
}

export const NoteDetailsPage = () => {
  const { mode: modeParam } = useLocalSearchParams<{
    id: string;
    mode?: string;
  }>();
  const [open, setOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<NoteEditorMode>(() =>
    parseEditorMode(modeParam)
  );
  const [isEditing, setIsEditing] = useState(
    () => parseEditorMode(modeParam) === "preview"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [headerFolder, setHeaderFolder] = useState<FolderSelection>(null);
  const [folderRequiredError, setFolderRequiredError] = useState(false);
  const saveActionRef = useRef<(() => void) | null>(null);
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();
  const { noteTitle, isPending, note, noteId } = useNoteDetailsData();

  const { notesAndThoughts, folders } = useControllers();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();
  const { mutateAsync: updateNoteFolderId } =
    notesAndThoughts.useUpdateNoteFolderIdMutation();

  const isPreviewMode = editorMode === "preview";

  const noteFolder = useMemo((): FolderSelection => {
    const folderId = note?.[0]?.folderId;
    if (!folderId || !allFolders) return null;
    return allFolders.find((folder) => folder.id === folderId) ?? null;
  }, [allFolders, note]);

  useEffect(() => {
    setHeaderFolder(noteFolder);
  }, [noteFolder]);

  useEffect(() => {
    const nextMode = parseEditorMode(modeParam);
    setEditorMode(nextMode);
    if (nextMode === "preview") {
      setIsEditing(true);
    }
  }, [modeParam, noteId]);

  const deleteAndLeave = useCallback(async () => {
    if (!noteId) return;
    setIsDiscarding(true);
    try {
      await deleteNoteAction(noteId);
      router.replace("/notes");
    } finally {
      setIsDiscarding(false);
    }
  }, [deleteNoteAction, noteId]);

  const handleDeleteNote = () => {
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm: async () => {
        closeModal();
        await deleteAndLeave();
      },
    });
  };

  const handleDiscardNote = () => {
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm: async () => {
        closeModal();
        await deleteAndLeave();
      },
    });
  };

  const switchToRegularMode = () => {
    if (editorMode === "regular") return;
    setEditorMode("regular");
    router.setParams({ mode: "regular" });
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    // Leaving edit after a preview save promotes the note to regular mode.
    if (!editing && editorMode === "preview") {
      switchToRegularMode();
    }
  };

  const handleEditPress = () => {
    if (isEditing) {
      saveActionRef.current?.();
      return;
    }
    setIsEditing(true);
  };

  const handleFolderSelect = useCallback(
    async (folder: FolderSelection) => {
      if (!folder) {
        Alert.alert(
          "Folder required",
          "Notes must be saved in a folder. Root is not allowed."
        );
        return;
      }
      setFolderRequiredError(false);
      setHeaderFolder(folder);
      if (!noteId) return;
      if (folder.id === (note?.[0]?.folderId ?? null)) return;
      try {
        await updateNoteFolderId({
          noteId,
          folderId: folder.id,
        });
      } catch (error) {
        setHeaderFolder(noteFolder);
        Alert.alert("Move failed", String(error));
      }
    },
    [note, noteFolder, noteId, updateNoteFolderId]
  );

  return (
    <PageContainer
      headerVariant="tab"
      title={noteTitle ?? ""}
      subtitle={
        isPreviewMode
          ? undefined
          : {
              text: "Note",
              icon: "notebook-text",
            }
      }
      subtitleContent={
        isPreviewMode ? (
          <DiscardNoteButton
            onPress={handleDiscardNote}
            disabled={isDiscarding || !noteId}
          />
        ) : undefined
      }
      hideBackButton={isPreviewMode}
      hideTabBar
      noScrollView
      optionsHeader={
        <NoteDetailsOptionsHeader
          folder={headerFolder}
          onFolderSelect={handleFolderSelect}
          simplified={simplified}
          onSimplifiedChange={setSimplified}
          folderError={folderRequiredError}
        />
      }
      buttons={
        noteId
          ? [
              <EditNoteButton
                key="edit-note"
                isEditing={isEditing}
                onPress={handleEditPress}
                disabled={isSaving || isDiscarding}
              />,
            ]
          : []
      }
      moreOptionsMenu={{
        links: [
          {
            label: "Delete Note",
            icon: "trash-2",
            action: handleDeleteNote,
          },
          { label: "Settings", icon: "settings", href: "/settings" },
        ],
        state: { open, setOpen },
        trigger: "ellipsis",
        currentWorkspace: false,
      }}
    >
      <NoteDetailsFeature
        isPending={isPending}
        note={note}
        isEditing={isEditing}
        onEditingChange={handleEditingChange}
        saveActionRef={saveActionRef}
        onSavingChange={setIsSaving}
        simplified={simplified}
        folderId={headerFolder?.id ?? null}
        onFolderErrorChange={setFolderRequiredError}
      />
    </PageContainer>
  );
};
