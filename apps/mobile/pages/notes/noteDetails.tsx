import { PageContainer } from "@/components/layout/page/pageContainer";
import type { MoreOptionsMenuLink } from "@/components/layout/header/moreOptions/moreOptionsMenu";
import { useModal } from "@/components/ui/modal/modal";
import { useControllers } from "@/api/controllers/useControllers";
import { useDeleteNote } from "@/features/notes/deleteNote/hooks/useDeleteNote";
import { EditNoteButton } from "@/features/notes/editNote/components/editNoteButton";
import { NoteEditorHeaderActions } from "@/features/notes/noteDetails/components/noteEditorHeaderActions";
import { NoteDetailsOptionsHeader } from "@/features/notes/noteDetails/components/noteDetailsOptionsHeader";
import { useNoteDetailsData } from "@/features/notes/noteDetails/hooks/useNoteDetailsData";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";
import type { NoteEditorMode } from "@/features/notes/noteDetails/types";
import { useNoteDraftStore } from "@/features/notes/noteDraft/store/noteDraftStore";
import {
  noteDetailsDeleteNoteMenuLabel,
  noteDetailsFolderRequiredAlertMessage,
  noteDetailsFolderRequiredAlertTitle,
  noteDetailsNoteSubtitle,
  noteDetailsSettingsMenuLabel,
  noteDetailsUpdateFailedAlertTitle,
} from "@/features/notes/noteDetails/noteDetailsLabels";
import { noteMoveFailedAlertTitle } from "@/features/notes/noteBottomSheet/noteBottomSheetLabels";
import type { FolderSelection } from "@/features/notes/shared/ui/folderSelector";
import { Person } from "@repo/zod-schemas";
import type { FeelingValue, Location } from "@repo/zod-schemas/src/schemas";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

function parseEditorMode(value: string | string[] | undefined): NoteEditorMode {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "new") return "new";
  if (raw === "preview") return "preview";
  return "regular";
}

function shouldStartEditing(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "preview" || raw === "edit" || raw === "new";
}

export const NoteDetailsPage = () => {
  const { mode: modeParam } = useLocalSearchParams<{
    id: string;
    mode?: string;
  }>();
  const segments = useSegments();
  const openedFromGraph = (segments as string[]).includes("graph");
  const clearDraft = useNoteDraftStore((s) => s.clearDraft);
  const [open, setOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<NoteEditorMode>(() =>
    parseEditorMode(modeParam)
  );
  const [isEditing, setIsEditing] = useState(() =>
    shouldStartEditing(modeParam)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [headerFolder, setHeaderFolder] = useState<FolderSelection>(null);
  const [headerPersons, setHeaderPersons] = useState<Person[]>([]);
  const [headerFeeling, setHeaderFeeling] = useState<FeelingValue | null>(null);
  const [headerLocationId, setHeaderLocationId] = useState<string | null>(null);
  const [headerLocationName, setHeaderLocationName] = useState<string | null>(
    null
  );
  const [folderRequiredError, setFolderRequiredError] = useState(false);
  const saveActionRef = useRef<(() => void) | null>(null);
  const { deleteNoteAction } = useDeleteNote();
  const { openModal, closeModal } = useModal();
  const isNewMode = editorMode === "new";
  const { noteTitle, isPending, note, noteId } = useNoteDetailsData(isNewMode);

  const { notesAndThoughts, folders } = useControllers();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();
  const { mutateAsync: updateNoteFolderId } =
    notesAndThoughts.useUpdateNoteFolderIdMutation();
  const { mutateAsync: updateNotePersons } =
    notesAndThoughts.useUpdateNotePersonsMutation();
  const { mutateAsync: updateNoteFeeling } =
    notesAndThoughts.useUpdateNoteFeelingMutation();
  const { mutateAsync: updateNoteLocation } =
    notesAndThoughts.useUpdateNoteLocationMutation();

  const isPreviewMode = editorMode === "preview";
  const showHeaderEditorActions = isPreviewMode || isEditing;
  const headerDenyVariant = isNewMode || isPreviewMode ? "delete" : "discard";

  const leaveAfterDelete = useCallback(() => {
    if (openedFromGraph) {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace("/graph");
      return;
    }
    router.replace("/notes");
  }, [openedFromGraph]);

  const noteFolder = useMemo((): FolderSelection => {
    const folderId = note?.[0]?.folderId;
    if (!folderId || !allFolders) return null;
    return allFolders.find((folder) => folder.id === folderId) ?? null;
  }, [allFolders, note]);

  // For new notes, initialize header state once from the draft note.
  useEffect(() => {
    if (!isNewMode || !note?.[0]) return;
    const draftNote = note[0];
    setHeaderFolder(noteFolder);
    setHeaderPersons(draftNote.persons ?? []);
    setHeaderFeeling(draftNote.feeling ?? null);
    setHeaderLocationId(draftNote.locationId ?? null);
    setHeaderLocationName(draftNote.locationName ?? null);
  }, [isNewMode, note, noteFolder]);

  useEffect(() => {
    if (isNewMode) return;
    setHeaderFolder(noteFolder);
  }, [isNewMode, noteFolder]);

  useEffect(() => {
    if (isNewMode) return;
    const nextPersons = note?.[0]?.persons ?? [];
    setHeaderPersons((current) => {
      const currentKey = current
        .map((person) => person.id)
        .sort()
        .join("|");
      const nextKey = nextPersons
        .map((person) => person.id)
        .sort()
        .join("|");
      return currentKey === nextKey ? current : nextPersons;
    });
  }, [isNewMode, note]);

  useEffect(() => {
    if (isNewMode) return;
    setHeaderFeeling(note?.[0]?.feeling ?? null);
  }, [isNewMode, note]);

  useEffect(() => {
    if (isNewMode) return;
    setHeaderLocationId(note?.[0]?.locationId ?? null);
    setHeaderLocationName(note?.[0]?.locationName ?? null);
  }, [isNewMode, note]);

  useEffect(() => {
    const nextMode = parseEditorMode(modeParam);
    setEditorMode(nextMode);
    if (shouldStartEditing(modeParam)) {
      setIsEditing(true);
    }
  }, [modeParam, noteId]);

  const deleteAndLeave = useCallback(async () => {
    if (!noteId) return;
    setIsDiscarding(true);
    try {
      await deleteNoteAction(noteId);
      leaveAfterDelete();
    } finally {
      setIsDiscarding(false);
    }
  }, [deleteNoteAction, leaveAfterDelete, noteId]);

  const handleDeleteNote = () => {
    openModal({
      modalName: "DELETE_NOTE_CONFIRMATION",
      onConfirm: async () => {
        closeModal();
        await deleteAndLeave();
      },
    });
  };

  const handleDenyNote = () => {
    if (isNewMode || isPreviewMode) {
      openModal({
        modalName: "DISCARD_UNSAVED_NOTE",
        onConfirm: async () => {
          closeModal();
          if (isNewMode) {
            clearDraft();
            leaveAfterDelete();
            return;
          }
          await deleteAndLeave();
        },
      });
      return;
    }

    openModal({
      modalName: "DISCARD_NOTE_CHANGES",
      onConfirm: () => {
        closeModal();
        handleEditingChange(false);
      },
    });
  };

  const handleConfirmNote = () => {
    saveActionRef.current?.();
  };

  const switchToRegularMode = () => {
    if (editorMode === "regular") return;
    setEditorMode("regular");
    router.setParams({ mode: "regular" });
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    // Leaving edit after a preview/new save promotes the note to regular mode.
    if (!editing && (editorMode === "preview" || editorMode === "new")) {
      if (editorMode === "new") {
        clearDraft();
      }
      switchToRegularMode();
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleFolderSelect = useCallback(
    async (folder: FolderSelection) => {
      if (!folder) {
        Alert.alert(
          noteDetailsFolderRequiredAlertTitle(),
          noteDetailsFolderRequiredAlertMessage()
        );
        return;
      }
      setFolderRequiredError(false);
      setHeaderFolder(folder);
      if (!noteId || isNewMode) return;
      if (folder.id === (note?.[0]?.folderId ?? null)) return;
      try {
        await updateNoteFolderId({
          noteId,
          folderId: folder.id,
        });
      } catch (error) {
        setHeaderFolder(noteFolder);
        Alert.alert(noteMoveFailedAlertTitle(), String(error));
      }
    },
    [isNewMode, note, noteFolder, noteId, updateNoteFolderId]
  );

  const handlePersonsChange = useCallback(
    async (persons: Person[]) => {
      setHeaderPersons(persons);
      if (!noteId || isNewMode) return;
      try {
        await updateNotePersons({ noteId, persons });
      } catch (error) {
        setHeaderPersons(note?.[0]?.persons ?? []);
        Alert.alert(noteDetailsUpdateFailedAlertTitle(), String(error));
      }
    },
    [isNewMode, note, noteId, updateNotePersons]
  );

  const handleFeelingChange = useCallback(
    async (feeling: FeelingValue | null) => {
      setHeaderFeeling(feeling);
      if (!noteId || isNewMode) return;
      try {
        await updateNoteFeeling({ noteId, feeling });
      } catch (error) {
        setHeaderFeeling(note?.[0]?.feeling ?? null);
        Alert.alert(noteDetailsUpdateFailedAlertTitle(), String(error));
      }
    },
    [isNewMode, note, noteId, updateNoteFeeling]
  );

  const handleLocationChange = useCallback(
    async (location: Location | null) => {
      setHeaderLocationId(location?.id ?? null);
      setHeaderLocationName(location?.name ?? null);
      if (!noteId || isNewMode) return;
      try {
        await updateNoteLocation({
          noteId,
          locationId: location?.id ?? null,
        });
      } catch (error) {
        setHeaderLocationId(note?.[0]?.locationId ?? null);
        setHeaderLocationName(note?.[0]?.locationName ?? null);
        Alert.alert(noteDetailsUpdateFailedAlertTitle(), String(error));
      }
    },
    [isNewMode, note, noteId, updateNoteLocation]
  );

  const menuLinks: MoreOptionsMenuLink[] = [
    ...(isNewMode
      ? []
      : [
          {
            label: noteDetailsDeleteNoteMenuLabel(),
            icon: "trash-2" as const,
            action: handleDeleteNote,
          },
        ]),
    {
      label: noteDetailsSettingsMenuLabel(),
      icon: "settings" as const,
      href: "/settings",
    },
  ];

  return (
    <PageContainer
      headerVariant="tab"
      title={showHeaderEditorActions ? undefined : (noteTitle ?? "")}
      subtitle={
        showHeaderEditorActions
          ? undefined
          : {
              text: noteDetailsNoteSubtitle(),
              icon: "notebook-text",
            }
      }
      hideBackButton={showHeaderEditorActions}
      leftButtons={
        showHeaderEditorActions
          ? [
              <NoteEditorHeaderActions
                key="note-editor-actions"
                onConfirm={handleConfirmNote}
                onDeny={handleDenyNote}
                disabled={isSaving || isDiscarding || !noteId}
                denyVariant={headerDenyVariant}
              />,
            ]
          : undefined
      }
      hideTabBar
      noScrollView
      optionsHeader={
        <NoteDetailsOptionsHeader
          folder={headerFolder}
          onFolderSelect={handleFolderSelect}
          persons={headerPersons}
          onPersonsChange={handlePersonsChange}
          feeling={headerFeeling}
          onFeelingChange={handleFeelingChange}
          locationId={headerLocationId}
          locationName={headerLocationName}
          onLocationChange={handleLocationChange}
          simplified={simplified}
          onSimplifiedChange={setSimplified}
          folderError={folderRequiredError}
        />
      }
      buttons={
        noteId && !showHeaderEditorActions
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
        links: menuLinks,
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
        persons={headerPersons}
        feeling={headerFeeling}
        locationId={headerLocationId}
        locationName={headerLocationName}
        isNew={isNewMode}
        onFolderErrorChange={setFolderRequiredError}
      />
    </PageContainer>
  );
};
