import { Alert } from "react-native";
import { SwitchSetting } from "@/features/settings/components/switchSetting";
import { useModal } from "@/components/ui/modal/modal";
import { useRecoveryPassphrase } from "../hooks/useRecoveryPassphrase";
import { RecoveryPassphraseSetupForm } from "./recoveryPassphraseSetupForm";

export const EnableRecoveryPassword = () => {
  const { openModal, closeModal } = useModal();
  const {
    recoveryPassphraseEnabled,
    biometricAvailable,
    busy,
    setBusy,
    enableRecoveryPassphrase,
    disableRecoveryPassphrase,
  } = useRecoveryPassphrase();

  const runDisable = async () => {
    setBusy(true);
    try {
      await disableRecoveryPassphrase();
    } catch (e) {
      Alert.alert(
        "Recovery Password",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setBusy(false);
    }
  };

  const openSetupModal = () => {
    openModal({
      title: "Recovery Password",
      dismissOnBackgroundPress: false,
      customContent: () => (
        <RecoveryPassphraseSetupForm
          onCancel={closeModal}
          onConfirm={async (passphrase) => {
            setBusy(true);
            try {
              await enableRecoveryPassphrase(passphrase);
              closeModal();
            } catch (e) {
              Alert.alert(
                "Recovery Password",
                e instanceof Error ? e.message : "Unknown error"
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      ),
      onConfirm: undefined,
      onCancel: undefined,
      confirmButton: undefined,
      cancelButton: undefined,
    });
  };

  const onToggle = async (next: boolean) => {
    if (busy || next === recoveryPassphraseEnabled) return;

    if (!biometricAvailable) {
      Alert.alert(
        "Biometrics unavailable",
        "Use a device with Face ID or fingerprint enrolled, and a development build (not Expo Go)."
      );
      return;
    }

    if (!next) {
      Alert.alert(
        "Disable Recovery Password",
        "This deletes your recovery passphrase. Exports made with recovery enabled won't unlock with recovery unless you remember the passphrase you chose.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => {
              void runDisable();
            },
          },
        ]
      );
      return;
    }

    openSetupModal();
  };

  return (
    <SwitchSetting
      title="Recovery Password"
      description="Enable Recovery Password to add a second unlock option to exported workspaces."
      checked={recoveryPassphraseEnabled}
      disabled={!biometricAvailable || busy}
      onCheckedChange={onToggle}
      accessibilityLabel="Enable Recovery Password"
    />
  );
};
