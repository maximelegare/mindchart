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

  const openErrorModal = (message: string) => {
    openModal({
      title: "Recovery Password",
      description: message,
      aboveBottomSheet: true,
      confirmButton: { text: "Ok", variant: "default" },
      cancelButton: { text: "Cancel", variant: "default" },
      onConfirm: closeModal,
      onCancel: closeModal,
    });
  };

  const runDisable = async () => {
    closeModal();
    setBusy(true);
    try {
      await disableRecoveryPassphrase();
    } catch (e) {
      openErrorModal(e instanceof Error ? e.message : "Unknown error");
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

  const openSetupModal = () => {
    openModal({
      title: "Recovery Password",
      aboveBottomSheet: true,
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
              openErrorModal(e instanceof Error ? e.message : "Unknown error");
            } finally {
              setBusy(false);
            }
          }}
        />
      ),
    });
  };

  const onToggle = async (next: boolean) => {
    if (busy || next === recoveryPassphraseEnabled) return;

    if (!biometricAvailable) {
      openModal({
        modalName: "BIOMETRICS_UNAVAILABLE",
        aboveBottomSheet: true,
        onConfirm: closeModal,
        onCancel: closeModal,
      });
      return;
    }

    if (!next) {
      openDisableModal();
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
