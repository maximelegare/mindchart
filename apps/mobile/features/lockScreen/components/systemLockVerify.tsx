import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { authenticateWithDeviceLock } from "@/lib/localAuth";

type SystemLockVerifyProps = {
  title?: string;
  description?: string;
  onVerify: () => void;
  onCancel: () => void;
};

export function SystemLockVerify({
  title = "Confirm device lock",
  description = "Authenticate with your device biometrics or PIN to continue.",
  onVerify,
  onCancel,
}: SystemLockVerifyProps) {
  const { colorScheme } = useColorScheme();

  const authenticate = useCallback(async () => {
    const result = await authenticateWithDeviceLock(
      "Confirm to change lock screen settings",
      "Cancel"
    );
    if (result.success) {
      onVerify();
    }
  }, [onVerify]);

  useEffect(() => {
    void authenticate();
  }, [authenticate]);

  return (
    <View className="flex-1 items-center justify-center px-2 py-8 gap-6">
      <View
        className="rounded-full items-center justify-center p-6"
        style={{ backgroundColor: hsl("muted", colorScheme) }}
      >
        <Icon name="lock-keyhole" color="foreground" size={28} />
      </View>

      <View className="gap-2 items-center">
        <Typography variant="h2" className="text-center">
          {title}
        </Typography>
        <Typography
          variant="p"
          className="text-center"
          style={{ color: hsl("muted-foreground", colorScheme) }}
        >
          {description}
        </Typography>
      </View>

      <View className="w-full gap-3">
        <Button onPress={() => void authenticate()} className="w-full">
          <Typography>Authenticate</Typography>
        </Button>
        <Button variant="ghost" onPress={onCancel} className="w-full">
          <Typography>Cancel</Typography>
        </Button>
      </View>
    </View>
  );
}
