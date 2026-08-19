import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

export async function checkBiometricAvailability(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return (
    hasHardware && isEnrolled && SecureStore.canUseBiometricAuthentication()
  );
}

export type LocalAuthResult =
  | { success: true }
  | { success: false; cancelled: boolean; reason?: string };

export async function authenticateWithDeviceLock(
  promptMessage: string,
  cancelLabel = "Cancel"
): Promise<LocalAuthResult> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    disableDeviceFallback: false,
  });

  if (result.success) {
    return { success: true };
  }

  const reason =
    "error" in result && result.error ? String(result.error) : "failed";

  return {
    success: false,
    cancelled: reason === "user_cancel" || reason === "system_cancel",
    reason,
  };
}
