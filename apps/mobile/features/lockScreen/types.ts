export type LockScreenMode = "off" | "system" | "customPin";

export const LOCK_SCREEN_MODE_LABELS: Record<LockScreenMode, string> = {
  off: "Off",
  system: "Device lock",
  customPin: "Custom PIN",
};
