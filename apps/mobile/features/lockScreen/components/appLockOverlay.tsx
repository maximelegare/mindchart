import { StyleSheet, View } from "react-native";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useAppLock } from "../context/appLockProvider";
import { EnterPasscode } from "./enterPasscode";
import { SystemLockScreen } from "./systemLockScreen";

export function AppLockOverlay() {
  const { colorScheme } = useColorScheme();
  const { isLocked, isReady } = useAppLock();
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );

  if (!isReady || !isLocked) {
    return null;
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 9999, backgroundColor: hsl("background", colorScheme) },
      ]}
    >
      {lockScreenMode === "system" ? <SystemLockScreen /> : <EnterPasscode />}
    </View>
  );
}
