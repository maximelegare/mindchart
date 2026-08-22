import { fbs } from "fbtee";
import type { LockScreenMode } from "./types";

export function SettingsLockScreenSectionTitle() {
  return <fbt desc="Settings section: lock screen">Lock screen</fbt>;
}

export function settingsLockScreenRowLabel() {
  return fbs("Lock screen", "Settings row: lock screen");
}

export function SettingsCustomPinSheetTitle() {
  return <fbt desc="Custom PIN setup sheet title">Custom PIN</fbt>;
}

export function settingsLockScreenModeOff() {
  return fbs("Off", "Lock screen mode: off");
}

export function settingsLockScreenModeSystem() {
  return fbs("Device lock", "Lock screen mode: system");
}

export function settingsLockScreenModeCustomPin() {
  return fbs("Custom PIN", "Lock screen mode: custom PIN");
}

export function getLockScreenModeLabel(mode: LockScreenMode): string {
  switch (mode) {
    case "off":
      return settingsLockScreenModeOff();
    case "system":
      return settingsLockScreenModeSystem();
    case "customPin":
      return settingsLockScreenModeCustomPin();
  }
}

export function settingsLockScreenModeOffDescription() {
  return fbs("No lock screen", "Lock screen mode off description");
}

export function settingsLockScreenModeSystemDescription() {
  return fbs(
    "Device biometrics or system PIN",
    "Lock screen mode system description"
  );
}

export function settingsLockScreenModeCustomPinDescription() {
  return fbs(
    "Your own 6-digit app PIN",
    "Lock screen mode custom PIN description"
  );
}

export function getLockScreenModeDescription(mode: LockScreenMode): string {
  switch (mode) {
    case "off":
      return settingsLockScreenModeOffDescription();
    case "system":
      return settingsLockScreenModeSystemDescription();
    case "customPin":
      return settingsLockScreenModeCustomPinDescription();
  }
}

export function SettingsLockScreenIntro() {
  return (
    <fbt desc="Lock screen settings intro">
      Choose how MindChart locks when you leave the app.
    </fbt>
  );
}

export function settingsLockScreenConfirmDeviceLockTitle() {
  return fbs(
    "Confirm device lock",
    "Lock screen verify: confirm device lock title"
  );
}

export function settingsLockScreenConfirmDeviceLockDescription() {
  return fbs(
    "Authenticate to change or turn off your lock screen.",
    "Lock screen verify: confirm device lock description"
  );
}

export function settingsLockScreenEnableDeviceLockTitle() {
  return fbs(
    "Enable device lock",
    "Lock screen verify: enable device lock title"
  );
}

export function settingsLockScreenEnableDeviceLockDescription() {
  return fbs(
    "Authenticate with your device biometrics or PIN to enable this lock screen.",
    "Lock screen verify: enable device lock description"
  );
}

export function settingsLockScreenBiometricsSwitchTitle() {
  return fbs(
    "Unlock with biometrics",
    "Lock screen biometrics shortcut switch title"
  );
}

export function settingsLockScreenBiometricsSwitchDescription() {
  return fbs(
    "Use Face ID, fingerprint, or device PIN as a shortcut when a custom PIN is enabled.",
    "Lock screen biometrics shortcut switch description"
  );
}

export function settingsLockScreenBiometricsAccessibilityLabel() {
  return fbs(
    "Unlock with biometrics",
    "Lock screen biometrics switch accessibility label"
  );
}

export function SettingsCustomPinActiveDescription() {
  return (
    <fbt desc="Custom PIN manage: active description">
      Your custom PIN is active.
    </fbt>
  );
}

export function settingsCustomPinChangeButton() {
  return fbs("Change PIN", "Custom PIN manage: change button");
}

export function settingsCustomPinRemoveButton() {
  return fbs("Remove PIN", "Custom PIN manage: remove button");
}

export function settingsCreatePinTitle() {
  return fbs("Create a PIN", "Create PIN screen title");
}

export function settingsConfirmPinTitle() {
  return fbs("Confirm your PIN", "Confirm PIN screen title");
}

export function settingsNewPinTitle() {
  return fbs("New PIN", "Change PIN: new PIN title");
}

export function settingsConfirmNewPinTitle() {
  return fbs("Confirm new PIN", "Change PIN: confirm new PIN title");
}

export function settingsVerifyPinTitle() {
  return fbs("Enter your PIN", "Verify PIN screen title");
}

export function settingsCreatePinDescription() {
  return fbs(
    "Choose a 6-digit PIN to unlock MindChart.",
    "Create PIN screen description"
  );
}

export function settingsConfirmPinDescription() {
  return fbs(
    "Re-enter the same PIN to confirm.",
    "Confirm PIN screen description"
  );
}

export function settingsChangePinDescription() {
  return fbs("Choose a new 6-digit PIN.", "Change PIN screen description");
}

export function settingsVerifyPinDescription() {
  return fbs(
    "Enter your current PIN to continue.",
    "Verify PIN screen description"
  );
}

export function settingsPinMismatchError() {
  return fbs("PINs do not match. Try again.", "PIN setup mismatch error");
}

export function settingsIncorrectPinError() {
  return fbs("Incorrect PIN. Try again.", "PIN verification incorrect error");
}

export function settingsUnlockMindChartTitle() {
  return fbs("Unlock MindChart", "App lock screen title");
}

export function settingsUnlockMindChartSystemDescription() {
  return fbs(
    "Use your device biometrics or PIN to unlock.",
    "System lock screen description"
  );
}

export function settingsUnlockMindChartCustomDescription() {
  return fbs(
    "Use your custom PIN or device lock",
    "Enter passcode: custom PIN with biometrics description"
  );
}

export function settingsUnlockMindChartPinOnlyDescription() {
  return fbs("Enter your custom PIN", "Enter passcode: PIN only description");
}

export function settingsUnlockMindChartBiometricPrompt() {
  return fbs("Unlock MindChart", "Biometric unlock prompt title");
}

export function settingsUnlockMindChartUsePinLabel() {
  return fbs("Use PIN", "Biometric unlock fallback button");
}

export function settingsSystemLockVerifyDefaultTitle() {
  return fbs("Confirm device lock", "System lock verify default title");
}

export function settingsSystemLockVerifyDefaultDescription() {
  return fbs(
    "Authenticate with your device biometrics or PIN to continue.",
    "System lock verify default description"
  );
}

export function settingsSystemLockVerifyCancelLabel() {
  return fbs("Cancel", "System lock verify cancel button");
}

export function settingsSystemLockVerifyContinueLabel() {
  return fbs("Continue", "System lock verify continue button");
}

export function settingsSystemLockVerifySettingsPrompt() {
  return fbs(
    "Confirm to change lock screen settings",
    "System lock verify settings prompt"
  );
}

export function settingsAppLockedTitle() {
  return fbs("MindChart is locked", "System lock screen title");
}

export function settingsUnlockButton() {
  return fbs("Unlock", "App lock unlock button");
}

export function settingsVerifyPinConfirmDescription() {
  return fbs(
    "Confirm your current PIN to continue.",
    "Verify PIN screen description"
  );
}

export function settingsChangePinNewDescription() {
  return fbs(
    "Enter a new 6-digit PIN for MindChart.",
    "Change PIN screen description"
  );
}

export function settingsSystemLockVerifyAuthenticateLabel() {
  return fbs("Authenticate", "System lock verify authenticate button");
}

export function settingsCreatePinCancelButton() {
  return fbs("Cancel", "Create PIN cancel button");
}
