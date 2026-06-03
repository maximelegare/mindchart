import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { Workspace } from "../context/workspacesContext";
import { extractWorkspaceExportZip } from "../services/workspaceExportZip";
import { decryptSqlCipherKey } from "../services/workspaceExportCrypto";
import { debugExportLog } from "../utils/debugExportLog";
import { WorkspacePasswordModal } from "./workspacePasswordModal";
import { ImportDecryptingContent } from "./importDecryptingContent";
import { WorkspaceEdit, type WorkspaceFormValues } from "./workspaceEdit";

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
  | "newWorkspace"
  | "applying";

export const ImportWorkspaceFlowModal = ({
  zipUri,
  hasActiveWorkspace,
  onCancel,
  onComplete,
  onApplyNew,
  onApplyOverwrite,
  importErrorMessage,
}: Props) => {
  const [step, setStep] = useState<ImportFlowStep>("password");
  const [payload, setPayload] = useState<ImportPayload | null>(null);

  useEffect(() => {
    debugExportLog(
      "importWorkspaceFlowModal.tsx:mount",
      "import flow modal mounted",
      { hasActiveWorkspace, zipUri },
      "I"
    );
  }, [hasActiveWorkspace, zipUri]);

  const handlePassword = async (password: string) => {
    setStep("decrypting");
    debugExportLog(
      "importWorkspaceFlowModal.tsx:decrypt-start",
      "decrypting zip",
      { zipUri },
      "I"
    );
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
      debugExportLog(
        "importWorkspaceFlowModal.tsx:decrypt-ok",
        "zip decrypted",
        { byteLength: data.dbBytes.length, hasActiveWorkspace },
        "I"
      );

      setPayload(data);
      if (!hasActiveWorkspace) {
        setStep("newWorkspace");
        return;
      }

      setStep("choice");
      debugExportLog(
        "importWorkspaceFlowModal.tsx:choice-step",
        "showing new vs overwrite",
        {},
        "I"
      );
    } catch (error) {
      console.error("Workspace import decrypt failed:", error);
      Alert.alert("Import failed", importErrorMessage(error));
      onCancel();
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
      onComplete({ success: false, error });
    }
  };

  if (step === "password") {
    return (
      <View className="flex-col gap-4">
        <Typography variant="h3">Import Workspace</Typography>
        <WorkspacePasswordModal
          mode="import"
          onCancel={onCancel}
          onConfirm={handlePassword}
        />
      </View>
    );
  }

  if (step === "decrypting" || step === "applying") {
    return <ImportDecryptingContent />;
  }

  if (step === "newWorkspace" && payload) {
    return (
      <View className="flex-col gap-4">
        <Typography variant="h3">New Workspace</Typography>
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

  if (step === "choice" && payload) {
    return (
      <View className="flex-col gap-4">
        <Typography variant="h3">Import Workspace</Typography>
        <Typography variant="p">
          Create a new workspace from this file, or overwrite the currently
          active workspace?
        </Typography>
        <View className="flex-col gap-2">
          <Button onPress={() => setStep("newWorkspace")}>
            <Typography>New workspace</Typography>
          </Button>
          <Button variant="destructive" onPress={runApplyOverwrite}>
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
