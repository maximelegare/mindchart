import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { authenticateWithDeviceLock } from "@/lib/localAuth";
import { useAppLock } from "../context/appLockProvider";

export function SystemLockScreen() {
  const { colorScheme } = useColorScheme();
  const { unlock } = useAppLock();

  const unlockWithDevice = useCallback(async () => {
    const result = await authenticateWithDeviceLock(
      "Unlock MindChart",
      "Cancel"
    );
    if (result.success) {
      unlock();
    }
  }, [unlock]);

  useEffect(() => {
    void unlockWithDevice();
  }, [unlockWithDevice]);

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: hsl("background", colorScheme) }}
    >
      <View
        className="rounded-full items-center justify-center p-6 mb-10"
        style={{ backgroundColor: hsl("muted", colorScheme) }}
      >
        <Icon name="lock-keyhole" color="foreground" size={32} />
      </View>

      <Typography variant="h2" className="text-center mb-2">
        MindChart is locked
      </Typography>
      <Typography
        variant="p"
        className="text-center mb-10"
        style={{ color: hsl("muted-foreground", colorScheme) }}
      >
        Use your device biometrics or PIN to continue.
      </Typography>

      <Button onPress={() => void unlockWithDevice()} className="w-full">
        <Typography>Unlock</Typography>
      </Button>
    </View>
  );
}
