import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { useAppLock } from "../context/appLockProvider";
import {
  useLockScreenSettingsUi,
  type PinSheetSession,
} from "../context/lockScreenSettingsUiContext";
import { clearAppPin, hasAppPin } from "../services/passcodeService";
import { CreatePasscode } from "../components/createPasscode";
import { ChangePasscode } from "../components/changePasscode";
import { VerifyPasscode } from "../components/verifyPasscode";
import {
  SettingsCustomPinActiveDescription,
  settingsCustomPinChangeButton,
  settingsCustomPinRemoveButton,
} from "../lockScreenLabels";

type SetupMode = "create" | "change" | "remove" | "manage" | "verify-activate";

type LockScreenPinSetupFeatureProps = {
  session: PinSheetSession;
  onPinConfigured?: () => void;
};

export function LockScreenPinSetupFeature({
  session,
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

  const [hasPin, setHasPin] = useState(session.hasPin);
  const [mode, setMode] = useState<SetupMode>(() =>
    resolveInitialMode(session.hasPin, lockScreenMode)
  );

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
    onPinConfigured?.();
  }, [activateCustomPin, onPinConfigured]);

  const handleChangeDone = useCallback(async () => {
    await refreshPinState();
    setMode("manage");
  }, [refreshPinState]);

  const handleCancelCreate = useCallback(() => {
    closePinSheet();
  }, [closePinSheet]);

  const handleRemoveVerified = useCallback(async () => {
    await clearAppPin();
    await refreshPinState();
    setLockScreenMode("off");
    closePinSheet();
  }, [closePinSheet, refreshPinState, setLockScreenMode]);

  if (mode === "create") {
    return (
      <CreatePasscode
        onDone={() => void handleCreateDone()}
        onCancel={handleCancelCreate}
      />
    );
  }

  if (mode === "change") {
    return (
      <ChangePasscode
        onDone={() => void handleChangeDone()}
        onCancel={() => setMode("manage")}
      />
    );
  }

  if (mode === "remove") {
    return (
      <VerifyPasscode
        onVerify={() => void handleRemoveVerified()}
        onCancel={() => setMode("manage")}
      />
    );
  }

  if (mode === "verify-activate") {
    return (
      <VerifyPasscode
        onVerify={() => void activateCustomPin()}
        onCancel={closePinSheet}
      />
    );
  }

  if (!hasPin) {
    return (
      <CreatePasscode
        onDone={() => void handleCreateDone()}
        onCancel={handleCancelCreate}
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
        <SettingsCustomPinActiveDescription />
      </Typography>

      <Button variant="secondary" onPress={() => setMode("change")}>
        <Typography>{settingsCustomPinChangeButton()}</Typography>
      </Button>
      <Button variant="destructive" onPress={() => setMode("remove")}>
        <Typography>{settingsCustomPinRemoveButton()}</Typography>
      </Button>
    </View>
  );
}

function resolveInitialMode(
  hasPin: boolean,
  lockScreenMode: string
): SetupMode {
  if (!hasPin) return "create";
  if (lockScreenMode !== "customPin") return "verify-activate";
  return "manage";
}
