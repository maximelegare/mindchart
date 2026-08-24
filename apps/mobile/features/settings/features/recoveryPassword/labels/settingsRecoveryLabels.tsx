import { fbs } from "fbtee";

export function settingsRecoveryPassphraseAlertTitle() {
  return fbs("Recovery passphrase", "Recovery passphrase alert title");
}

export function settingsRecoveryPassphraseSwitchTitle() {
  return fbs("Recovery passphrase", "Recovery passphrase switch title");
}

export function settingsRecoveryPassphraseSwitchDescription() {
  return fbs(
    "Add a recovery passphrase as a second unlock option for exported workspaces.",
    "Recovery passphrase switch description"
  );
}

export function settingsRecoveryPassphraseSwitchAccessibilityLabel() {
  return fbs(
    "Enable recovery passphrase",
    "Recovery passphrase switch accessibility label"
  );
}

export function SettingsRecoveryPassphraseSetupDescription() {
  return (
    <fbt desc="Recovery passphrase setup form description">
      Choose a passphrase. You'll need it to import exported workspaces if you
      forget the export password.
    </fbt>
  );
}

export function settingsRecoveryPassphraseFieldLabel() {
  return fbs("Passphrase", "Recovery passphrase field label");
}

export function settingsRecoveryPassphraseFieldPlaceholder() {
  return fbs("Passphrase", "Recovery passphrase field placeholder");
}

export function settingsRecoveryPassphraseConfirmLabel() {
  return fbs("Confirm", "Recovery passphrase confirm field label");
}

export function settingsRecoveryPassphraseConfirmPlaceholder() {
  return fbs(
    "Confirm passphrase",
    "Recovery passphrase confirm field placeholder"
  );
}

export function settingsRecoveryPassphraseMinLengthError(min: number) {
  return fbs(
    ["At least ", fbs.param("min", String(min)), " characters"],
    "Recovery passphrase minimum length validation"
  );
}

export function settingsRecoveryPassphraseMismatchError() {
  return fbs(
    "Passphrases do not match",
    "Recovery passphrase mismatch validation"
  );
}

export function settingsRecoveryPassphraseEnabling() {
  return fbs("Enabling…", "Recovery passphrase enabling button state");
}

export function SettingsRecoveryPassphraseRevealSavedDescription() {
  return (
    <fbt desc="Recovery passphrase reveal: saved description">
      Save this somewhere safe. Long-press to copy-friendly view.
    </fbt>
  );
}

export function SettingsRecoveryPassphraseRevealReminderDescription() {
  return (
    <fbt desc="Recovery passphrase reveal: reminder description">
      Reveal your saved recovery passphrase if you need a reminder.
    </fbt>
  );
}

export function settingsRecoveryPassphraseHideButton() {
  return fbs("Hide passphrase", "Recovery passphrase hide button");
}

export function settingsRecoveryPassphraseAuthenticating() {
  return fbs("Authenticating…", "Recovery passphrase authenticating state");
}

export function settingsRecoveryPassphraseRevealButton() {
  return fbs("Reveal passphrase", "Recovery passphrase reveal button");
}
