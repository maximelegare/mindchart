import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
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
  const { refreshCustomPinState } = useAppLock();

  const [hasPin, setHasPin] = useState(initialHasPin);
  const [mode, setMode] = useState<SetupMode>("idle");
  const [isReady, setIsReady] = useState(!isActive);

  useEffect(() => {
    if (!isActive) {
      setIsReady(false);
      return;
    }

    void hasAppPin().then((exists) => {
      setHasPin(exists);
      setMode(exists ? "idle" : "create");
      setIsReady(true);
    });
  }, [isActive]);

  const refreshPinState = useCallback(async () => {
    const exists = await hasAppPin();
    setHasPin(exists);
    await refreshCustomPinState();
    onPinConfigured?.();
  }, [onPinConfigured, refreshCustomPinState]);

  const activateCustomPin = useCallback(async () => {
    await refreshPinState();
    setLockScreenMode("customPin");
    closePinSheet();
  }, [closePinSheet, refreshPinState, setLockScreenMode]);

  const handleCreateDone = useCallback(async () => {
    await activateCustomPin();
    setMode("idle");
  }, [activateCustomPin]);

  const handleChangeDone = useCallback(async () => {
    await refreshPinState();
    setMode("idle");
  }, [refreshPinState]);

  const handleCancel = useCallback(() => {
    if (mode === "create" && !hasPin) {
      closePinSheet();
      return;
    }
    setMode("idle");
  }, [closePinSheet, hasPin, mode]);

  const handleRemoveVerified = useCallback(async () => {
    await clearAppPin();
    await refreshPinState();
    setLockScreenMode("off");
    setMode("idle");
    closePinSheet();
  }, [closePinSheet, refreshPinState, setLockScreenMode]);

  if (isActive && !isReady) {
    return <View style={{ minHeight: 320 }} />;
  }

  if (mode === "create") {
    return (
      <CreatePasscode
        onDone={() => void handleCreateDone()}
        onCancel={handleCancel}
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
      <CreatePasscode
        onDone={() => void handleCreateDone()}
        onCancel={closePinSheet}
      />
    );
  }

  if (lockScreenMode !== "customPin") {
    return (
      <VerifyPasscode
        onVerify={() => void activateCustomPin()}
        onCancel={closePinSheet}
      />
    );
  }

  return (
    <View className="px-2 justify-center gap-4 py-8">
      <Typography
        variant="p"
        className="text-center mb-2"
        style={{ color: hsl("muted-foreground", colorScheme) }}
      >
        Your custom PIN is active.
      </Typography>

      <Button variant="secondary" onPress={() => setMode("change")}>
        <Typography>Change PIN</Typography>
      </Button>
      <Button variant="destructive" onPress={() => setMode("remove")}>
        <Typography>Remove PIN</Typography>
      </Button>
    </View>
  );
}
