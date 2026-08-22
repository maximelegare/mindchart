import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { Workspace } from "../../context/workspacesContext";
import {
  extractWorkspaceExportZip,
  type ExtractedWorkspaceExport,
} from "../../services/workspaceExportZip";
import {
  decryptSqlCipherKey,
  decryptSqlCipherKeyFromRecovery,
  hasRecoveryEnvelope,
} from "../../services/workspaceExportCrypto";
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
import { settingsActionCancel } from "@/features/settings/settingsLabels";
import {
  WorkspaceImportOverwriteDescription,
  workspaceImportApplyingDescription,
  workspaceImportApplyingTitle,
  workspaceImportChoiceDescription,
  workspaceImportConfirmLabel,
  workspaceImportDecryptingDescription,
  workspaceImportDecryptingTitle,
  workspaceImportDefaultName,
  workspaceImportFailedAlertTitle,
  workspaceImportModalTitle,
  workspaceImportNewWorkspaceButton,
  workspaceImportNewWorkspaceDescription,
  workspaceImportNewWorkspaceModalTitle,
  workspaceImportOverwriteActiveButton,
  workspaceImportOverwriteConfirmButton,
  workspaceImportOverwriteModalTitle,
  workspaceImportReadingExportDescription,
  workspaceImportReadingExportTitle,
  workspaceImportUseExportPasswordLink,
  workspaceImportUseRecoveryPassphraseLink,
} from "@/features/workspaces/workspaceModalLabels";

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
  | "extracting"
  | "password"
  | "decrypting"
  | "choice"
  | "confirmOverwrite"
  | "newWorkspace"
  | "applying";

type UnlockMode = "password" | "recovery";

const ImportLoadingStep = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <View className="flex-col gap-2">
    <ModalTitle title={workspaceImportModalTitle()} />
    <LoadingState title={title} description={description} size="large" />
  </View>
);

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
  const [step, setStep] = useState<ImportFlowStep>("extracting");
  const [extracted, setExtracted] = useState<ExtractedWorkspaceExport | null>(
    null
  );
  const [extractError, setExtractError] = useState<string | null>(null);
  const [unlockMode, setUnlockMode] = useState<UnlockMode>("password");
  const [pendingSecret, setPendingSecret] = useState<string | null>(null);
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const hasRecovery = extracted
    ? hasRecoveryEnvelope(extracted.metadata)
    : false;

  useEffect(() => {
    let cancelled = false;

    const loadExport = async () => {
      try {
        const data = await extractWorkspaceExportZip(zipUri);
        if (cancelled) return;
        setExtracted(data);
        setStep("password");
      } catch (error) {
        if (cancelled) return;
        console.error("Workspace import extract failed:", error);
        setExtractError(getWorkspaceImportErrorMessage(error));
      }
    };

    void loadExport();

    return () => {
      cancelled = true;
    };
  }, [zipUri]);

  const handleUnlock = (secret: string) => {
    if (!extracted) return;
    setUnlockError(null);
    setPendingSecret(secret);
    setStep("decrypting");
  };

  useEffect(() => {
    if (step !== "decrypting" || pendingSecret == null || !extracted) return;

    let cancelled = false;
    const secret = pendingSecret;

    const runDecrypt = async () => {
      try {
        const sqlcipherKey =
          unlockMode === "recovery"
            ? await decryptSqlCipherKeyFromRecovery(extracted.metadata, secret)
            : await decryptSqlCipherKey(extracted.metadata, secret);

        if (cancelled) return;

        const data: ImportPayload = {
          dbBytes: extracted.dbBytes,
          sqlcipherKey,
        };
        setPayload(data);
        setPendingSecret(null);
        if (!hasActiveWorkspace) {
          setStep("newWorkspace");
          return;
        }
        setStep("choice");
      } catch (error) {
        if (cancelled) return;
        if (!isWorkspaceExportDecryptError(error)) {
          console.error("Workspace import decrypt failed:", error);
        }
        setUnlockError(getWorkspaceImportErrorMessage(error));
        setPendingSecret(null);
        setStep("password");
      }
    };

    void runDecrypt();

    return () => {
      cancelled = true;
    };
  }, [step, pendingSecret, extracted, unlockMode, hasActiveWorkspace]);

  const switchUnlockMode = (mode: UnlockMode) => {
    setUnlockMode(mode);
    setUnlockError(null);
  };

  const runApplyNew = async (details: WorkspaceFormValues) => {
    if (!payload) return;
    setStep("applying");
    try {
      const workspace = await onApplyNew(payload, details);
      onComplete({ success: true, workspace });
    } catch (error) {
      console.error("Workspace import apply failed:", error);
      Alert.alert(workspaceImportFailedAlertTitle(), importErrorMessage(error));
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
      Alert.alert(workspaceImportFailedAlertTitle(), importErrorMessage(error));
      setStep("choice");
      onComplete({ success: false, error });
    }
  };

  if (step === "extracting" && !extractError) {
    return (
      <ImportLoadingStep
        title={workspaceImportReadingExportTitle()}
        description={workspaceImportReadingExportDescription()}
      />
    );
  }

  if (extractError) {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title={workspaceImportModalTitle()} />
        <Typography className="text-foreground-errors" variant="p">
          {extractError}
        </Typography>
        <View className="flex-row justify-end gap-2 mt-2">
          <Button variant="default" onPress={onCancel}>
            <Typography>{settingsActionCancel()}</Typography>
          </Button>
        </View>
      </View>
    );
  }

  if (step === "password") {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title={workspaceImportModalTitle()} />
        {unlockMode === "password" ? (
          <WorkspacePasswordModal
            mode="import"
            errorMessage={unlockError}
            onPasswordChange={() => setUnlockError(null)}
            onCancel={onCancel}
            onConfirm={handleUnlock}
          />
        ) : (
          <WorkspacePasswordModal
            mode="import-recovery"
            errorMessage={unlockError}
            onPassphraseChange={() => setUnlockError(null)}
            onCancel={onCancel}
            onConfirm={handleUnlock}
          />
        )}
        {hasRecovery ? (
          <Button
            variant="link"
            onPress={() =>
              switchUnlockMode(
                unlockMode === "password" ? "recovery" : "password"
              )
            }
          >
            <Typography>
              {unlockMode === "password"
                ? workspaceImportUseRecoveryPassphraseLink()
                : workspaceImportUseExportPasswordLink()}
            </Typography>
          </Button>
        ) : null}
      </View>
    );
  }

  if (step === "decrypting") {
    return (
      <ImportLoadingStep
        title={workspaceImportDecryptingTitle()}
        description={workspaceImportDecryptingDescription()}
      />
    );
  }

  if (step === "applying") {
    return (
      <ImportLoadingStep
        title={workspaceImportApplyingTitle()}
        description={workspaceImportApplyingDescription()}
      />
    );
  }

  if (step === "newWorkspace" && payload) {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title={workspaceImportNewWorkspaceModalTitle()} />
        <WorkspaceEdit
          initialName={workspaceImportDefaultName()}
          confirmLabel={workspaceImportConfirmLabel()}
          description={workspaceImportNewWorkspaceDescription()}
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
        <ModalTitle title={workspaceImportOverwriteModalTitle()} />
        <Typography variant="p">
          <WorkspaceImportOverwriteDescription
            workspaceName={activeWorkspaceName}
          />
        </Typography>
        <View className="flex-row justify-end gap-2 mt-2">
          <Button variant="default" onPress={() => setStep("choice")}>
            <Typography>{settingsActionCancel()}</Typography>
          </Button>
          <Button
            variant="destructive"
            onPress={() => void runApplyOverwrite()}
          >
            <Typography>{workspaceImportOverwriteConfirmButton()}</Typography>
          </Button>
        </View>
      </View>
    );
  }

  if (step === "choice" && payload) {
    return (
      <View className="flex-col gap-4">
        <ModalTitle title={workspaceImportModalTitle()} />
        <Typography variant="p">
          {workspaceImportChoiceDescription()}
        </Typography>
        <View className="flex-col gap-2">
          <Button onPress={() => setStep("newWorkspace")}>
            <Typography>{workspaceImportNewWorkspaceButton()}</Typography>
          </Button>
          <Button
            variant="destructive"
            onPress={() => setStep("confirmOverwrite")}
          >
            <Typography>{workspaceImportOverwriteActiveButton()}</Typography>
          </Button>
          <Button variant="outline" onPress={onCancel}>
            <Typography>{settingsActionCancel()}</Typography>
          </Button>
        </View>
      </View>
    );
  }

  return null;
};
