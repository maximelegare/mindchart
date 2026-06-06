import { useState } from "react";
import { Alert, View } from "react-native";
import { SwitchSetting } from "@/features/settings/components/switchSetting";
import { CustomSettingComponent } from "@/features/settings/components/customSettingComponent";
import { useRecoveryPassphrase } from "../hooks/useRecoveryPassphrase";
import { RecoveryPassphraseSetupForm } from "./recoveryPassphraseSetupForm";

export const EnableRecoveryPassword = () => {
  const [setupVisible, setSetupVisible] = useState(false);
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

    setSetupVisible(true);
  };

  const handleSetupConfirm = async (passphrase: string) => {
    setBusy(true);
    try {
      await enableRecoveryPassphrase(passphrase);
      setSetupVisible(false);
    } catch (e) {
      Alert.alert(
        "Recovery Password",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-3">
      <SwitchSetting
        title="Recovery Password"
        description="Enable Recovery Password to add a second unlock option to exported workspaces."
        checked={recoveryPassphraseEnabled}
        disabled={!biometricAvailable || busy}
        onCheckedChange={onToggle}
        accessibilityLabel="Enable Recovery Password"
      />

      {setupVisible ? (
        <CustomSettingComponent
          title="Choose recovery passphrase"
          description="Pick a passphrase you can remember. You will use it to import workspaces if you forget the export password."
        >
          <RecoveryPassphraseSetupForm
            onCancel={() => setSetupVisible(false)}
            onConfirm={handleSetupConfirm}
          />
        </CustomSettingComponent>
      ) : null}
    </View>
  );
};
