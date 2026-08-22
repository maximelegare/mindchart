import { useCallback, useState } from "react";
import { Vibration, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { verifyAppPin } from "../services/passcodeService";
import { APP_PIN_LENGTH } from "../constants";
import { PinDots, PinPad } from "./pinPad";
import {
  settingsCreatePinCancelButton,
  settingsIncorrectPinError,
  settingsVerifyPinConfirmDescription,
  settingsVerifyPinTitle,
} from "../lockScreenLabels";

type VerifyPasscodeProps = {
  onVerify: () => void;
  onCancel?: () => void;
};

export function VerifyPasscode({ onVerify, onCancel }: VerifyPasscodeProps) {
  const { colorScheme } = useColorScheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const verifyEnteredPin = useCallback(
    async (pinToVerify: string) => {
      const valid = await verifyAppPin(pinToVerify);
      if (valid) {
        onVerify();
      } else {
        Vibration.vibrate([0, 50, 100, 150]);
        setPin("");
        setError(settingsIncorrectPinError());
        setTimeout(() => setError(""), 2000);
      }
    },
    [onVerify]
  );

  const pressDigit = useCallback(
    (digit: string) => {
      const nextPin = pin + digit;
      if (nextPin.length > APP_PIN_LENGTH) return;

      setPin(nextPin);
      if (nextPin.length === APP_PIN_LENGTH) {
        void verifyEnteredPin(nextPin);
      }
    },
    [pin, verifyEnteredPin]
  );

  const deleteDigit = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

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

      <Typography variant="h2" className="text-center mb-2">
        {settingsVerifyPinTitle()}
      </Typography>
      <Typography
        variant="p"
        className="text-center mb-8 px-2"
        style={{ color: hsl("muted-foreground", colorScheme) }}
      >
        {settingsVerifyPinConfirmDescription()}
      </Typography>

      <PinDots filledCount={pin.length} />
      <Typography
        variant="small"
        className="text-center mb-10 min-h-[20px]"
        style={{ color: hsl("foreground-errors", colorScheme) }}
      >
        {error}
      </Typography>

      <PinPad onDigit={pressDigit} onDelete={deleteDigit} />

      {onCancel ? (
        <Button variant="ghost" onPress={onCancel} className="mt-8">
          <Typography>{settingsCreatePinCancelButton()}</Typography>
        </Button>
      ) : null}
    </View>
  );
}
