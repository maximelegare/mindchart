import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { SwitchSetting } from "@/features/settings/components/switchSetting";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { checkBiometricAvailability } from "@/lib/localAuth";
import { useAppLock } from "../context/appLockProvider";
import { clearAppPin, hasAppPin } from "../services/passcodeService";
import { CreatePasscode } from "../components/createPasscode";
import { ChangePasscode } from "../components/changePasscode";
import { VerifyPasscode } from "../components/verifyPasscode";
import { useLockScreenSettingsUi } from "../context/lockScreenSettingsUiContext";

type SetupMode = "idle" | "create" | "change" | "remove";

type LockScreenPinSetupFeatureProps = {
  isActive: boolean;
  initialHasPin: boolean;
  onPinConfigured?: () => void;
};

export function LockScreenPinSetupFeature({
  isActive,
  initialHasPin,
  onPinConfigured,
}: LockScreenPinSetupFeatureProps) {
  const { colorScheme } = useColorScheme();
  const { closePinSheet } = useLockScreenSettingsUi();
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );
  const setLockScreenMode = useSecuritySettingsPreferences(
    (s) => s.setLockScreenMode
  );
  const customPinBiometricEnabled = useSecuritySettingsPreferences(
    (s) => s.customPinBiometricEnabled
  );
  const setCustomPinBiometricEnabled = useSecuritySettingsPreferences(
    (s) => s.setCustomPinBiometricEnabled
  );
  const { refreshCustomPinState } = useAppLock();

  const [hasPin, setHasPin] = useState(initialHasPin);
  const [verified, setVerified] = useState(!initialHasPin);
  const [mode, setMode] = useState<SetupMode>("idle");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isReady, setIsReady] = useState(!isActive);

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setIsReady(false);
      return;
    }

    setMode("idle");

    void hasAppPin().then((exists) => {
      setHasPin(exists);
      setVerified(!exists);
      setIsReady(true);
    });
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setHasPin(initialHasPin);
    }
  }, [initialHasPin, isActive]);

  const refreshPinState = useCallback(async () => {
    const exists = await hasAppPin();
    setHasPin(exists);
    setVerified(exists);
    await refreshCustomPinState();
    onPinConfigured?.();
  }, [onPinConfigured, refreshCustomPinState]);

  const handleCreateDone = useCallback(async () => {
    await refreshPinState();
    setLockScreenMode("customPin");
    setMode("idle");
    closePinSheet();
  }, [closePinSheet, refreshPinState, setLockScreenMode]);

  const handleChangeDone = useCallback(async () => {
    await refreshPinState();
    setMode("idle");
  }, [refreshPinState]);

  const handleRemoveVerified = useCallback(async () => {
    await clearAppPin();
    await refreshPinState();
    setLockScreenMode("off");
    setMode("idle");
    setVerified(false);
    closePinSheet();
  }, [closePinSheet, refreshPinState, setLockScreenMode]);

  if (isActive && !isReady) {
    return <View style={{ minHeight: 320 }} />;
  }

  if (hasPin && !verified) {
    return (
      <VerifyPasscode
        onVerify={() => setVerified(true)}
        onCancel={closePinSheet}
      />
    );
  }

  if (mode === "create") {
    return (
      <CreatePasscode
        onDone={() => void handleCreateDone()}
        onCancel={() => setMode("idle")}
      />
    );
  }

  if (mode === "change") {
    return (
      <ChangePasscode
        onDone={() => void handleChangeDone()}
        onCancel={() => setMode("idle")}
      />
    );
  }

  if (mode === "remove") {
    return (
      <VerifyPasscode
        onVerify={() => void handleRemoveVerified()}
        onCancel={() => setMode("idle")}
      />
    );
  }

  if (!hasPin) {
    return (
      <View className="px-2 justify-center gap-6 py-8">
        <View className="items-center gap-4">
          <View
            className="rounded-full p-5"
            style={{ backgroundColor: hsl("muted", colorScheme) }}
          >
            <Icon name="lock-keyhole" color="foreground" size={32} />
          </View>
          <Typography variant="h2" className="text-center">
            Set your PIN
          </Typography>
          <Typography
            variant="p"
            className="text-center"
            style={{ color: hsl("muted-foreground", colorScheme) }}
          >
            Create a 6-digit PIN to lock MindChart when you leave the app.
          </Typography>
        </View>

        <Button onPress={() => setMode("create")}>
          <Typography>Enable custom PIN</Typography>
        </Button>
      </View>
    );
  }

  return (
    <View className="px-2 justify-center gap-4 py-8">
      <View className="items-center gap-3 mb-4">
        <View
          className="rounded-full p-5"
          style={{ backgroundColor: hsl("muted", colorScheme) }}
        >
          <Icon name="lock-keyhole" color="foreground" size={32} />
        </View>
        <Typography variant="h2" className="text-center">
          Custom PIN
        </Typography>
        <Typography
          variant="p"
          className="text-center"
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          Manage your app PIN settings.
        </Typography>
      </View>

      {lockScreenMode === "customPin" && biometricAvailable ? (
        <SwitchSetting
          title="Unlock with biometrics"
          description="Use Face ID, fingerprint, or device PIN as a shortcut when a custom PIN is enabled."
          checked={customPinBiometricEnabled}
          onCheckedChange={setCustomPinBiometricEnabled}
          accessibilityLabel="Unlock with biometrics"
        />
      ) : null}

      <Button variant="secondary" onPress={() => setMode("change")}>
        <Typography>Change PIN</Typography>
      </Button>
      <Button variant="destructive" onPress={() => setMode("remove")}>
        <Typography>Remove PIN</Typography>
      </Button>
    </View>
  );
}
