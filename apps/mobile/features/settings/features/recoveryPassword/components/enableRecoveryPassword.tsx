import { useState } from "react";
import { Alert, View } from "react-native";
import { SwitchSetting } from "@/features/settings/components/switchSetting";
import { useModal } from "@/components/ui/modal/modal";
import { useRecoveryPassphrase } from "../hooks/useRecoveryPassphrase";
import { RecoveryPassphraseSetupForm } from "./recoveryPassphraseSetupForm";
import { RecoveryPassphraseReveal } from "./recoveryPassphraseReveal";

export const EnableRecoveryPassphrase = () => {
  const { openModal, closeModal } = useModal();
  const {
    recoveryPassphraseEnabled,
    busy,
    setBusy,
    enableRecoveryPassphrase,
    disableRecoveryPassphrase,
  } = useRecoveryPassphrase();
  const [showSetup, setShowSetup] = useState(false);

  const openErrorAlert = (message: string) => {
    Alert.alert("Recovery passphrase", message);
  };

  const runDisable = async () => {
    closeModal();
    setBusy(true);
    try {
      await disableRecoveryPassphrase();
      setShowSetup(false);
    } catch (e) {
      openErrorAlert(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const openDisableModal = () => {
    openModal({
      modalName: "DISABLE_RECOVERY_PASSWORD",
      aboveBottomSheet: true,
      onConfirm: () => {
        void runDisable();
      },
      onCancel: closeModal,
    });
  };

  const onToggle = async (next: boolean) => {
    if (busy || next === recoveryPassphraseEnabled) return;

    if (!next) {
      setShowSetup(false);
      openDisableModal();
      return;
    }

    setShowSetup(true);
  };

  return (
    <View style={{ gap: 12 }}>
      <SwitchSetting
        title="Recovery passphrase"
        description="Add a recovery passphrase as a second unlock option for exported workspaces."
        checked={recoveryPassphraseEnabled || showSetup}
        disabled={busy}
        onCheckedChange={onToggle}
        accessibilityLabel="Enable recovery passphrase"
      />

      {showSetup && !recoveryPassphraseEnabled ? (
        <RecoveryPassphraseSetupForm
          onCancel={() => setShowSetup(false)}
          onConfirm={async (passphrase) => {
            setBusy(true);
            try {
              await enableRecoveryPassphrase(passphrase);
              setShowSetup(false);
            } catch (e) {
              openErrorAlert(e instanceof Error ? e.message : "Unknown error");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {recoveryPassphraseEnabled ? <RecoveryPassphraseReveal /> : null}
    </View>
  );
};
