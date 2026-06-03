import type { ReactNode } from "react";
import { WorkspacePasswordModal } from "../components/workspacePasswordModal";

type ModalFns = {
  openModal: (options: {
    title?: string;
    customContent?: () => ReactNode;
  }) => void;
  closeModal: () => void;
};

export const promptWorkspaceImportPassword = ({
  openModal,
  closeModal,
}: ModalFns): Promise<string | null> =>
  new Promise((resolve) => {
    openModal({
      title: "Import Workspace",
      customContent: () => (
        <WorkspacePasswordModal
          mode="import"
          onConfirm={(password) => {
            // Do not close here — importWorkspace swaps to the next step via
            // setModalContent; closeModal races with that and hides the modal.
            resolve(password);
          }}
          onCancel={() => {
            closeModal();
            resolve(null);
          }}
        />
      ),
    });
  });
