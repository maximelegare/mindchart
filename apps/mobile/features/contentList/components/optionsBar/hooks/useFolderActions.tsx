import { useCallback } from "react";
import {
  buildChildFolderPath,
  buildRootFolderPath,
  canCreateChildFolder,
  getParentFolderPath,
  isFolderPathUnder,
} from "@repo/sqlite";
import { Alert } from "react-native";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { useControllers } from "@/api/controllers/useControllers";
import { useModal } from "@/components/ui/modal/modal";
import { generateID } from "@/utils/genrateID";
import { useOptionsBar } from "../context/optionBarContext";
import { FolderFormModalContent } from "../components/folders/folderFormModalContent";
import { useFolderFormSheet } from "../components/folders/folderFormSheet";
import { FolderSelection } from "@/features/notes/shared/ui/folderSelector";

type FolderTarget = { kind: "root" } | { kind: "folder"; folder: Folder };

export const useFolderActions = () => {
  const { openModal, closeModal } = useModal();
  const { openFolderFormSheet, closeFolderFormSheet } = useFolderFormSheet();
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
          "Maximum depth",
          "Folders can only be nested 3 levels deep."
        );
        return;
      }
      openFolderFormSheet({
        mode: "create",
        onSave: async (label) => {
          const id = generateID();
          const path =
            target.kind === "root"
              ? buildRootFolderPath(id)
              : buildChildFolderPath(target.folder.path, id);
          await insertFolder({
            data: { id, path, label },
          });
          closeFolderFormSheet();
        },
      });
    },
    [closeFolderFormSheet, insertFolder, openFolderFormSheet]
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
