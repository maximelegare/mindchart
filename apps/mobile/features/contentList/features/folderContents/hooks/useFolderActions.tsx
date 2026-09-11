import { useCallback } from "react";
import {
  buildChildFolderPath,
  buildRootFolderPath,
  canCreateChildFolder,
  getParentFolderPath,
  isFolderPathUnder,
} from "@repo/sqlite";
import { Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Folder } from "@repo/zod-schemas";
import { useControllers } from "@/api/controllers/useControllers";
import { useModal } from "@/components/ui/modal/modal";
import { generateID } from "@/utils/genrateID";
import { setGraphModeImmediate } from "@/features/graph/context/graphContext";
import { graphIdFromFolderId } from "@/features/navigation/syncLinkedBreadcrumbs";
import { useOptionsBar } from "../../../components/optionsBar/context/optionBarContext";
import { FolderFormModalContent } from "../components/folderFormModalContent";
import { useFolderFormSheet } from "../components/folderFormSheet";
import {
  folderFormMaximumDepthAlertTitle,
  folderNestingLimitErrorMessage,
} from "../components/folderFormLabels";
import { FolderSelection } from "@/features/notes/shared/ui/folderSelector";

type FolderTarget = { kind: "root" } | { kind: "folder"; folder: Folder };

export const useFolderActions = () => {
  const { openModal, closeModal } = useModal();
  const { openFolderFormSheet, closeFolderFormSheet } = useFolderFormSheet();
  const router = useRouter();
  const segments = useSegments();
  const currentFolderId = useOptionsBar((s) => s.currentFolderId);
  const handleCurrentFolderChange = useOptionsBar(
    (s) => s.handleCurrentFolderChange
  );
  const { folders } = useControllers();
  const { mutateAsync: insertFolder } = folders.useInsertFolderMutation();
  const { mutateAsync: updateFolderLabel } =
    folders.useUpdateFolderLabelMutation();
  const { mutateAsync: deleteFolderByPath } =
    folders.useDeleteFolderByPathMutation();
  const { mutateAsync: moveFolder } = folders.useMoveFolderMutation();
  const { data: allFolders } = folders.useFetchAllFoldersQuery();

  const resetIfCurrentDeleted = useCallback(
    (deletedPath: string) => {
      if (!currentFolderId || !allFolders) {
        return;
      }
      const current = allFolders.find((f) => f.id === currentFolderId);
      if (!current) {
        handleCurrentFolderChange(null);
        return;
      }
      if (isFolderPathUnder(deletedPath, current.path)) {
        const parentPath = getParentFolderPath(deletedPath);
        if (!parentPath) {
          handleCurrentFolderChange(null);
          return;
        }
        const parentId = parentPath.split("/").filter(Boolean).pop() ?? null;
        handleCurrentFolderChange(parentId);
      }
    },
    [allFolders, currentFolderId, handleCurrentFolderChange]
  );

  const openCreateFolderModal = useCallback(
    (target: FolderTarget) => {
      const parentPath = target.kind === "root" ? null : target.folder.path;
      if (!canCreateChildFolder(parentPath)) {
        Alert.alert(
          folderFormMaximumDepthAlertTitle(),
          folderNestingLimitErrorMessage()
        );
        return;
      }
      const parentFolder = target.kind === "root" ? null : target.folder;
      const isGraphFocused = (segments as string[]).includes("graph");
      openFolderFormSheet({
        mode: "create",
        parentFolder,
        onSave: async (label, selectedParent) => {
          const parent = selectedParent ?? null;
          const id = generateID();
          const path = parent
            ? buildChildFolderPath(parent.path, id)
            : buildRootFolderPath(id);
          await insertFolder({
            data: { id, path, label },
          });
          handleCurrentFolderChange(id);
          if (isGraphFocused) {
            setGraphModeImmediate("folder");
            router.navigate({
              pathname: "/graph/[id]",
              params: {
                id: graphIdFromFolderId(id),
                _t: Date.now().toString(),
              },
            });
          }
          closeFolderFormSheet();
        },
      });
    },
    [
      closeFolderFormSheet,
      handleCurrentFolderChange,
      insertFolder,
      openFolderFormSheet,
      router,
      segments,
    ]
  );

  const openRenameFolderModal = useCallback(
    (folder: Folder) => {
      openModal({
        customContent: () => (
          <FolderFormModalContent
            mode="rename"
            initialLabel={folder.label}
            onSave={async (label) => {
              await updateFolderLabel({ id: folder.id, label });
              closeModal();
            }}
          />
        ),
      });
    },
    [closeModal, openModal, updateFolderLabel]
  );

  const openDeleteFolderModal = useCallback(
    (folder: Folder) => {
      openModal({
        modalName: "DELETE_FOLDER_CONFIRMATION",
        onConfirm: async () => {
          await deleteFolderByPath({ path: folder.path });
          resetIfCurrentDeleted(folder.path);
          closeModal();
        },
        onCancel: closeModal,
      });
    },
    [closeModal, deleteFolderByPath, openModal, resetIfCurrentDeleted]
  );

  const getFolderParent = useCallback(
    (folder: Folder): FolderSelection => {
      const parentPath = getParentFolderPath(folder.path);
      if (!parentPath || !allFolders) return null;
      return allFolders.find((f) => f.path === parentPath) ?? null;
    },
    [allFolders]
  );

  const moveFolderTo = useCallback(
    async (folder: Folder, newParent: FolderSelection) => {
      await moveFolder({
        folderId: folder.id,
        newParentPath: newParent?.path ?? null,
      });
    },
    [moveFolder]
  );

  return {
    openCreateFolderModal,
    openRenameFolderModal,
    openDeleteFolderModal,
    getFolderParent,
    moveFolderTo,
  };
};
