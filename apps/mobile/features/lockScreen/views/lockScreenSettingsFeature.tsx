import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { SwitchSetting } from "@/features/settings/components/switchSetting";
import ListItem from "@/components/ui/list-item";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import type { LockScreenMode } from "../types";
import { LOCK_SCREEN_MODE_LABELS } from "../types";
import { useAppLock } from "../context/appLockProvider";
import { useLockScreenSettingsUi } from "../context/lockScreenSettingsUiContext";
import { checkBiometricAvailability } from "@/lib/localAuth";
import { clearAppPin } from "../services/passcodeService";
import { VerifyPasscode } from "../components/verifyPasscode";
import { SystemLockVerify } from "../components/systemLockVerify";

const MODE_OPTIONS: LockScreenMode[] = ["off", "system", "customPin"];

type PendingAction =
  | { type: "disable"; target: LockScreenMode }
  | { type: "enableSystem" }
  | null;

type LockScreenSettingsFeatureProps = {
  onPinConfigured?: () => void;
};

export function LockScreenSettingsFeature({
  onPinConfigured,
}: LockScreenSettingsFeatureProps = {}) {
  const { colorScheme } = useColorScheme();
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

  const { refreshCustomPinState, unlock } = useAppLock();
  const { openPinSheet } = useLockScreenSettingsUi();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const refreshPinConfigured = useCallback(async () => {
    await refreshCustomPinState();
  }, [refreshCustomPinState]);

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, []);

  const enableSystemLock = useCallback(() => {
    setLockScreenMode("system");
  }, [setLockScreenMode]);

  const disableLock = useCallback(async () => {
    if (lockScreenMode === "customPin") {
      await clearAppPin();
      await refreshPinConfigured();
    }
    setLockScreenMode("off");
    unlock();
  }, [lockScreenMode, refreshPinConfigured, setLockScreenMode, unlock]);

  const openCustomPinSheet = useCallback(() => {
    void openPinSheet().then(() => onPinConfigured?.());
  }, [onPinConfigured, openPinSheet]);

  const applyTarget = useCallback(
    async (target: LockScreenMode) => {
      if (target === "customPin") {
        openCustomPinSheet();
        return;
      }

      if (target === "system") {
        setPendingAction({ type: "enableSystem" });
        return;
      }

      await disableLock();
    },
    [disableLock, openCustomPinSheet]
  );

  const selectMode = useCallback(
    (mode: LockScreenMode) => {
      if (mode === lockScreenMode) {
        if (mode === "customPin") {
          openCustomPinSheet();
        }
        return;
      }

      if (lockScreenMode !== "off") {
        setPendingAction({ type: "disable", target: mode });
        return;
      }

      if (mode === "system") {
        setPendingAction({ type: "enableSystem" });
        return;
      }

      if (mode === "customPin") {
        openCustomPinSheet();
        return;
      }
    },
    [lockScreenMode, openCustomPinSheet]
  );

  const cancelPending = useCallback(() => {
    setPendingAction(null);
  }, []);

  const onDisableVerified = useCallback(() => {
    const target =
      pendingAction?.type === "disable" ? pendingAction.target : null;
    setPendingAction(null);
    if (target) {
      void applyTarget(target);
    }
  }, [applyTarget, pendingAction]);

  const onEnableSystemVerified = useCallback(() => {
    setPendingAction(null);
    enableSystemLock();
  }, [enableSystemLock]);

  if (pendingAction?.type === "disable" && lockScreenMode === "customPin") {
    return (
      <VerifyPasscode onVerify={onDisableVerified} onCancel={cancelPending} />
    );
  }

  if (pendingAction?.type === "disable" && lockScreenMode === "system") {
    return (
      <SystemLockVerify
        title="Confirm device lock"
        description="Authenticate to change or turn off your lock screen."
        onVerify={onDisableVerified}
        onCancel={cancelPending}
      />
    );
  }

  if (pendingAction?.type === "enableSystem") {
    return (
      <SystemLockVerify
        title="Enable device lock"
        description="Authenticate with your device biometrics or PIN to enable this lock screen."
        onVerify={onEnableSystemVerified}
        onCancel={cancelPending}
      />
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Typography variant="p" padding={false}>
        Choose how MindChart locks when you leave the app.
      </Typography>

      {MODE_OPTIONS.map((mode, index) => (
        <ListItem
          key={mode}
          surface="none"
          label={LOCK_SCREEN_MODE_LABELS[mode]}
          description={
            mode === "off"
              ? "No lock screen"
              : mode === "system"
                ? "Device biometrics or system PIN"
                : "Your own 6-digit app PIN"
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

      {lockScreenMode === "customPin" && biometricAvailable ? (
        <SwitchSetting
          title="Unlock with biometrics"
          description="Use Face ID, fingerprint, or device PIN as a shortcut when a custom PIN is enabled."
          checked={customPinBiometricEnabled}
          onCheckedChange={setCustomPinBiometricEnabled}
          accessibilityLabel="Unlock with biometrics"
        />
      ) : null}
    </View>
  );
}
