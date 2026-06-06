import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

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
        Choose a recovery passphrase. You will need it to import exported
        workspaces if you forget the export password.
      </Typography>

      <Controller
        control={control}
        name="passphrase"
        rules={{
          validate: (v) =>
            v.length >= MIN_PASSPHRASE_LENGTH ||
            `At least ${MIN_PASSPHRASE_LENGTH} characters`,
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="recovery-passphrase">Recovery passphrase</Label>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Recovery passphrase"
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassphrase"
        rules={{
          validate: (v) => v === passphrase || "Passphrases do not match",
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="recovery-passphrase-confirm">
              Confirm recovery passphrase
            </Label>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Confirm recovery passphrase"
              onSubmitEditing={submit}
            />
          </View>
        )}
      />

      <View className="flex-row justify-end gap-2 mt-2 items-center">
        <Button variant="default" onPress={onCancel} disabled={submitting}>
          <Typography>Cancel</Typography>
        </Button>
        <Button
          variant="default"
          disabled={!isValid || submitting}
          onPress={submit}
        >
          {submitting ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Typography>Enabling…</Typography>
            </View>
          ) : (
            <Typography>Enable</Typography>
          )}
        </Button>
      </View>
    </View>
  );
};
