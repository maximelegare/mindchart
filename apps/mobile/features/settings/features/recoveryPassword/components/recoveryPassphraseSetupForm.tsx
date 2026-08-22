import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { BottomSheetTextInput } from "@/components/primitives/bottomSheet/bottom-sheet.native";
import {
  SettingsRecoveryPassphraseSetupDescription,
  settingsRecoveryPassphraseConfirmLabel,
  settingsRecoveryPassphraseConfirmPlaceholder,
  settingsRecoveryPassphraseEnabling,
  settingsRecoveryPassphraseFieldLabel,
  settingsRecoveryPassphraseFieldPlaceholder,
  settingsRecoveryPassphraseMinLengthError,
  settingsRecoveryPassphraseMismatchError,
} from "@/features/settings/settingsRecoveryLabels";
import {
  settingsActionCancel,
  settingsActionEnable,
} from "@/features/settings/settingsLabels";

const MIN_PASSPHRASE_LENGTH = 8;

type FormValues = {
  passphrase: string;
  confirmPassphrase: string;
};

type Props = {
  onConfirm: (passphrase: string) => void | Promise<void>;
  onCancel: () => void;
};

export const RecoveryPassphraseSetupForm = ({ onConfirm, onCancel }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { passphrase: "", confirmPassphrase: "" },
  });

  const passphrase = watch("passphrase");

  const submit = handleSubmit(async ({ passphrase: value }) => {
    setSubmitting(true);
    try {
      await onConfirm(value);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <View className="flex-col gap-4">
      <Typography variant="muted">
        <SettingsRecoveryPassphraseSetupDescription />
      </Typography>

      <Controller
        control={control}
        name="passphrase"
        rules={{
          validate: (v) =>
            v.length >= MIN_PASSPHRASE_LENGTH ||
            settingsRecoveryPassphraseMinLengthError(MIN_PASSPHRASE_LENGTH),
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="recovery-passphrase">
              {settingsRecoveryPassphraseFieldLabel()}
            </Label>
            <BottomSheetTextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              placeholder={settingsRecoveryPassphraseFieldPlaceholder()}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassphrase"
        rules={{
          validate: (v) =>
            v === passphrase || settingsRecoveryPassphraseMismatchError(),
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="recovery-passphrase-confirm">
              {settingsRecoveryPassphraseConfirmLabel()}
            </Label>
            <BottomSheetTextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={settingsRecoveryPassphraseConfirmPlaceholder()}
              onSubmitEditing={submit}
            />
          </View>
        )}
      />

      <View className="flex-row justify-end gap-2 mt-2 items-center">
        <Button variant="default" onPress={onCancel} disabled={submitting}>
          <Typography>{settingsActionCancel()}</Typography>
        </Button>
        <Button
          variant="default"
          disabled={!isValid || submitting}
          onPress={submit}
        >
          {submitting ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Typography>{settingsRecoveryPassphraseEnabling()}</Typography>
            </View>
          ) : (
            <Typography>{settingsActionEnable()}</Typography>
          )}
        </Button>
      </View>
    </View>
  );
};
