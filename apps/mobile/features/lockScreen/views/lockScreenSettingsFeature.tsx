import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import ListItem from "@/components/ui/list-item";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import type { LockScreenMode } from "../types";
import { LOCK_SCREEN_MODE_LABELS } from "../types";
import { useAppLock } from "../context/appLockProvider";
import { clearAppPin } from "../services/passcodeService";
import { VerifyPasscode } from "../components/verifyPasscode";
import { SystemLockVerify } from "../components/systemLockVerify";

const MODE_OPTIONS: Array<Exclude<LockScreenMode, "customPin">> = [
  "off",
  "system",
];

export function LockScreenSettingsFeature() {
  const { colorScheme } = useColorScheme();
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );
  const setLockScreenMode = useSecuritySettingsPreferences(
    (s) => s.setLockScreenMode
  );

  const { refreshCustomPinState, unlock } = useAppLock();

  const [pendingMode, setPendingMode] = useState<LockScreenMode | null>(null);

  const refreshPinConfigured = useCallback(async () => {
    await refreshCustomPinState();
  }, [refreshCustomPinState]);

  const completeModeChange = useCallback(
    async (targetMode: LockScreenMode) => {
      if (lockScreenMode === "customPin") {
        await clearAppPin();
        await refreshPinConfigured();
      }

      setLockScreenMode(targetMode);
      if (targetMode === "off") {
        unlock();
      }
    },
    [lockScreenMode, refreshPinConfigured, setLockScreenMode, unlock]
  );

  const selectMode = useCallback(
    (mode: Exclude<LockScreenMode, "customPin">) => {
      if (mode === lockScreenMode) return;

      if (lockScreenMode !== "off") {
        setPendingMode(mode);
        return;
      }

      void completeModeChange(mode);
    },
    [completeModeChange, lockScreenMode]
  );

  const cancelVerification = useCallback(() => {
    setPendingMode(null);
  }, []);

  const onVerificationSuccess = useCallback(() => {
    const target = pendingMode;
    setPendingMode(null);
    if (target) {
      void completeModeChange(target);
    }
  }, [completeModeChange, pendingMode]);

  if (pendingMode != null && lockScreenMode === "customPin") {
    return (
      <VerifyPasscode
        onVerify={onVerificationSuccess}
        onCancel={cancelVerification}
      />
    );
  }

  if (pendingMode != null && lockScreenMode === "system") {
    return (
      <SystemLockVerify
        title="Turn off device lock?"
        description="Authenticate to change or remove your current lock screen."
        onVerify={onVerificationSuccess}
        onCancel={cancelVerification}
      />
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Typography variant="p" padding={false}>
        Choose how MindChart locks when you leave the app. Custom PIN is managed
        separately below.
      </Typography>

      {MODE_OPTIONS.map((mode, index) => (
        <ListItem
          key={mode}
          surface="none"
          label={LOCK_SCREEN_MODE_LABELS[mode]}
          description={
            mode === "off"
              ? "No lock screen"
              : "Device biometrics or system PIN"
          }
          borderBottom={index < MODE_OPTIONS.length - 1}
          noChevron
          onPress={() => selectMode(mode)}
          itemRight={() => (
            <Typography
              variant="small"
              style={{
                color:
                  lockScreenMode === mode
                    ? hsl("primary", colorScheme)
                    : hsl("muted-foreground", colorScheme),
              }}
            >
              {lockScreenMode === mode ? "Selected" : ""}
            </Typography>
          )}
        />
      ))}
    </View>
  );
}
