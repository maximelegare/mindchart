import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { setAppPin } from "../services/passcodeService";
import { APP_PIN_LENGTH } from "../constants";
import { PinDots, PinPad } from "./pinPad";
import {
  settingsConfirmPinDescription,
  settingsConfirmPinTitle,
  settingsCreatePinCancelButton,
  settingsCreatePinDescription,
  settingsCreatePinTitle,
  settingsPinMismatchError,
} from "../lockScreenLabels";

type CreatePasscodeProps = {
  onDone: () => void;
  onCancel?: () => void;
};

export function CreatePasscode({ onDone, onCancel }: CreatePasscodeProps) {
  const { colorScheme } = useColorScheme();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [draftPin, setDraftPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const currentPin = step === "create" ? draftPin : confirmPin;

  const save = useCallback(async () => {
    await setAppPin(draftPin);
    onDone();
  }, [draftPin, onDone]);

  const pressDigit = useCallback(
    (digit: string) => {
      const nextPin = currentPin + digit;
      if (nextPin.length > APP_PIN_LENGTH) return;

      if (step === "create") {
        setDraftPin(nextPin);
        if (nextPin.length === APP_PIN_LENGTH) {
          setTimeout(() => setStep("confirm"), 300);
        }
      } else {
        setConfirmPin(nextPin);
        if (nextPin.length === APP_PIN_LENGTH) {
          if (draftPin === nextPin) {
            void save();
          } else {
            setConfirmPin("");
            setError(settingsPinMismatchError());
            setTimeout(() => setError(""), 2000);
          }
        }
      }
    },
    [currentPin, draftPin, save, step]
  );

  const deleteDigit = useCallback(() => {
    if (step === "create") {
      setDraftPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  }, [step]);

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
        {step === "create"
          ? settingsCreatePinTitle()
          : settingsConfirmPinTitle()}
      </Typography>
      <Typography
        variant="p"
        className="text-center mb-8 px-2"
        style={{ color: hsl("muted-foreground", colorScheme) }}
      >
        {step === "create"
          ? settingsCreatePinDescription()
          : settingsConfirmPinDescription()}
      </Typography>

      <PinDots filledCount={currentPin.length} />
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
