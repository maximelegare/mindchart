import { useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { Workspace } from "../../context/workspacesContext";
import { extractWorkspaceExportZip } from "../../services/workspaceExportZip";
import { decryptSqlCipherKey } from "../../services/workspaceExportCrypto";
import {
  getWorkspaceImportErrorMessage,
  isWorkspaceExportDecryptError,
} from "../../services/workspaceExportErrors";
import { WorkspacePasswordModal } from "./workspacePasswordModal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import {
  WorkspaceEdit,
  type WorkspaceFormValues,
} from "../manageWorkspaces/workspaceEdit";
import { ModalTitle } from "@/components/ui/modal/components/modalTitle";

export type ImportPayload = {
  dbBytes: Uint8Array;
  sqlcipherKey: string;
};

type ImportResult = {
  success: boolean;
  workspace?: Workspace;
  canceled?: boolean;
  error?: unknown;
};

type Props = {
  zipUri: string;
  hasActiveWorkspace: boolean;
  activeWorkspaceName: string;
  onCancel: () => void;
  onComplete: (result: ImportResult) => void;
  onApplyNew: (
    payload: ImportPayload,
    details: WorkspaceFormValues
  ) => Promise<Workspace>;
  onApplyOverwrite: (payload: ImportPayload) => Promise<Workspace>;
  importErrorMessage: (error: unknown) => string;
};

export type ImportFlowStep =
  | "password"
  | "decrypting"
  | "choice"
  | "confirmOverwrite"
  | "newWorkspace"
  | "applying";

export const ImportWorkspaceFlowModal = ({
  zipUri,
  hasActiveWorkspace,
  activeWorkspaceName,
  onCancel,
  onComplete,
  onApplyNew,
  onApplyOverwrite,
  importErrorMessage,
}: Props) => {
  const [step, setStep] = useState<ImportFlowStep>("password");
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePassword = async (password: string) => {
    setPasswordError(null);
    setStep("decrypting");
    try {
      const extracted = await extractWorkspaceExportZip(zipUri);
      const sqlcipherKey = await decryptSqlCipherKey(
        extracted.metadata,
        password
      );
      const data: ImportPayload = {
        dbBytes: extracted.dbBytes,
        sqlcipherKey,
      };
      setPayload(data);
      if (!hasActiveWorkspace) {
        setStep("newWorkspace");
        return;
      }

      setStep("choice");
    } catch (error) {
      if (!isWorkspaceExportDecryptError(error)) {
        console.error("Workspace import decrypt failed:", error);
      }
      setPasswordError(getWorkspaceImportErrorMessage(error));
      setStep("password");
    }
  };

  const runApplyNew = async (details: WorkspaceFormValues) => {
    if (!payload) return;
    setStep("applying");
    try {
      const workspace = await onApplyNew(payload, details);
      onComplete({ success: true, workspace });
    } catch (error) {
      console.error("Workspace import apply failed:", error);
      Alert.alert("Import failed", importErrorMessage(error));
      onComplete({ success: false, error });
    }
  };

  const runApplyOverwrite = async () => {
    if (!payload) return;
    setStep("applying");
    try {
      const workspace = await onApplyOverwrite(payload);
      onComplete({ success: true, workspace });
    } catch (error) {
      console.error("Workspace import apply failed:", error);
      Alert.alert("Import failed", importErrorMessage(error));
      setStep("choice");
      onComplete({ success: false, error });
    }
  };

  if (step === "password") {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title="Import Workspace" />
        <WorkspacePasswordModal
          mode="import"
          errorMessage={passwordError}
          onPasswordChange={() => setPasswordError(null)}
          onCancel={onCancel}
          onConfirm={handlePassword}
        />
      </View>
    );
  }

  if (step === "decrypting") {
    return <LoadingState title="Decrypting workspace..." size="large" />;
  }

  if (step === "applying") {
    return <LoadingState title="Importing workspace..." size="large" />;
  }

  if (step === "newWorkspace" && payload) {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title="New Workspace" />
        <WorkspaceEdit
          initialName="Imported Workspace"
          confirmLabel="Import"
          description="Name your imported workspace and choose an icon and color."
          onCancel={() => {
            if (hasActiveWorkspace) {
              setStep("choice");
            } else {
              onCancel();
            }
          }}
          onConfirm={runApplyNew}
        />
      </View>
    );
  }

  if (step === "confirmOverwrite" && payload) {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title="Overwrite workspace?" />
        <Typography variant="p">
          All notes and data in &quot;{activeWorkspaceName}&quot; will be
          permanently replaced with the contents of this import. Your current
          workspace name, icon, and color will stay the same. This cannot be
          undone.
        </Typography>
        <View className="flex-row justify-end gap-2 mt-2">
          <Button variant="default" onPress={() => setStep("choice")}>
            <Typography>Cancel</Typography>
          </Button>
          <Button
            variant="destructive"
            onPress={() => void runApplyOverwrite()}
          >
            <Typography>Overwrite</Typography>
          </Button>
        </View>
      </View>
    );
  }

  if (step === "choice" && payload) {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title="Import Workspace" />
        <Typography variant="p">
          Create a new workspace from this file, or overwrite the currently
          active workspace?
        </Typography>
        <View className="flex-col gap-2">
          <Button onPress={() => setStep("newWorkspace")}>
            <Typography>New workspace</Typography>
          </Button>
          <Button
            variant="destructive"
            onPress={() => setStep("confirmOverwrite")}
          >
            <Typography>Overwrite active</Typography>
          </Button>
          <Button variant="outline" onPress={onCancel}>
            <Typography>Cancel</Typography>
          </Button>
        </View>
      </View>
    );
  }

  return null;
};
