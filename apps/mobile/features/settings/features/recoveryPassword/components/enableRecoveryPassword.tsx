import { useState } from "react";
import { Alert, View } from "react-native";
import { SwitchSetting } from "@/features/settings/components/switchSetting";
import { useModal } from "@/components/ui/modal/modal";
import { useRecoveryPassphrase } from "../hooks/useRecoveryPassphrase";
import { RecoveryPassphraseSetupForm } from "./recoveryPassphraseSetupForm";
import { RecoveryPassphraseReveal } from "./recoveryPassphraseReveal";
import {
  settingsRecoveryPassphraseAlertTitle,
  settingsRecoveryPassphraseSwitchAccessibilityLabel,
  settingsRecoveryPassphraseSwitchDescription,
  settingsRecoveryPassphraseSwitchTitle,
} from "@/features/settings/settingsRecoveryLabels";
import { settingsCommonUnknownError } from "@/features/settings/settingsLabels";

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
    Alert.alert(settingsRecoveryPassphraseAlertTitle(), message);
  };

  const runDisable = async () => {
    closeModal();
    setBusy(true);
    try {
      await disableRecoveryPassphrase();
      setShowSetup(false);
    } catch (e) {
      openErrorAlert(
        e instanceof Error ? e.message : settingsCommonUnknownError()
      );
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
        title={settingsRecoveryPassphraseSwitchTitle()}
        description={settingsRecoveryPassphraseSwitchDescription()}
        checked={recoveryPassphraseEnabled || showSetup}
        disabled={busy}
        onCheckedChange={onToggle}
        accessibilityLabel={settingsRecoveryPassphraseSwitchAccessibilityLabel()}
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
              openErrorAlert(
                e instanceof Error ? e.message : settingsCommonUnknownError()
              );
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
