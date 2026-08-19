import { useCallback, useEffect, useState } from "react";
import { Vibration, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import {
  authenticateWithDeviceLock,
  checkBiometricAvailability,
} from "@/lib/localAuth";
import { useAppLock } from "../context/appLockProvider";
import { verifyAppPin } from "../services/passcodeService";
import { APP_PIN_LENGTH } from "../constants";
import { PinDots, PinPad } from "./pinPad";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";

export function EnterPasscode() {
  const { colorScheme } = useColorScheme();
  const { unlock } = useAppLock();
  const customPinBiometricEnabled = useSecuritySettingsPreferences(
    (s) => s.customPinBiometricEnabled
  );

  const [pin, setPin] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const showBiometric = customPinBiometricEnabled && biometricAvailable;

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, []);

  const verifyPin = useCallback(
    async (pinToVerify: string) => {
      try {
        const valid = await verifyAppPin(pinToVerify);
        if (valid) {
          unlock();
        } else {
          Vibration.vibrate([0, 50, 100, 150]);
          setPin("");
        }
      } catch {
        Vibration.vibrate([0, 50, 100, 150]);
        setPin("");
      }
    },
    [unlock]
  );

  const pressDigit = useCallback(
    (digit: string) => {
      const nextPin = pin + digit;
      if (nextPin.length > APP_PIN_LENGTH) return;

      setPin(nextPin);
      if (nextPin.length === APP_PIN_LENGTH) {
        void verifyPin(nextPin);
      }
    },
    [pin, verifyPin]
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    const result = await authenticateWithDeviceLock(
      "Unlock MindChart",
      "Use PIN"
    );
    if (result.success) {
      unlock();
    } else if (!result.cancelled) {
      Vibration.vibrate([0, 100]);
    }
  }, [unlock]);

  return (
    <View
      className="flex-1 items-center justify-center px-4"
      style={{ backgroundColor: hsl("background", colorScheme) }}
    >
      <View
        className="rounded-full items-center justify-center p-6 mb-10"
        style={{ backgroundColor: hsl("muted", colorScheme) }}
      >
        <Icon name="lock-keyhole" color="foreground" size={28} />
      </View>

      <Typography variant="h2" className="text-center mb-1">
        Enter your PIN
      </Typography>
      <Typography
        variant="p"
        className="text-center mb-10"
        style={{ color: hsl("muted-foreground", colorScheme) }}
      >
        {showBiometric
          ? "Use your custom PIN or device lock"
          : "Enter your custom PIN"}
      </Typography>

      <PinDots filledCount={pin.length} variant="circle" />

      <PinPad
        variant="circle"
        onDigit={pressDigit}
        onDelete={handleDelete}
        onBiometric={authenticateWithBiometric}
        showBiometric={showBiometric}
      />
    </View>
  );
}
