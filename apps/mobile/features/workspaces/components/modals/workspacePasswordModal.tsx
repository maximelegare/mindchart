import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

const MIN_PASSWORD_LENGTH = 8;

type ExportFormValues = {
  password: string;
  confirmPassword: string;
};

type ImportFormValues = {
  password: string;
};

type Props =
  | {
      mode: "export";
      description?: string;
      confirmLabel?: string;
      onConfirm: (password: string) => void | Promise<void>;
      onCancel: () => void;
    }
  | {
      mode: "import";
      description?: string;
      confirmLabel?: string;
      errorMessage?: string | null;
      onPasswordChange?: () => void;
      onConfirm: (password: string) => void | Promise<void>;
      onCancel: () => void;
    };

export const WorkspacePasswordModal = (props: Props) => {
  const {
    mode,
    description,
    confirmLabel = mode === "export" ? "Export" : "Import",
    onConfirm,
    onCancel,
  } = props;

  if (mode === "export") {
    return (
      <ExportPasswordForm
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  if (mode === "import") {
    return (
      <ImportPasswordForm
        description={description}
        confirmLabel={confirmLabel}
        errorMessage={props.errorMessage}
        onPasswordChange={props.onPasswordChange}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  return null;
};

const ExportPasswordForm = ({
  description = "Choose a password to protect this export. You will need it to import the workspace later.",
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  description?: string;
  confirmLabel: string;
  onConfirm: (password: string) => void | Promise<void>;
  onCancel: () => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<ExportFormValues>({
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const submit = handleSubmit(async ({ password: pwd }) => {
    setSubmitting(true);
    try {
      await onConfirm(pwd);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <View className="flex-col gap-4">
      <Typography variant="muted">{description}</Typography>

      <Controller
        control={control}
        name="password"
        rules={{
          validate: (v) =>
            v.length >= MIN_PASSWORD_LENGTH ||
            `At least ${MIN_PASSWORD_LENGTH} characters`,
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="export-password">Password</Label>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Export password"
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          validate: (v) => v === password || "Passwords do not match",
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="export-password-confirm">Confirm password</Label>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Confirm password"
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
              <Typography>Exporting…</Typography>
            </View>
          ) : (
            <Typography>{confirmLabel}</Typography>
          )}
        </Button>
      </View>
    </View>
  );
};

const ImportPasswordForm = ({
  description = "Enter the password you used when exporting this workspace.",
  confirmLabel,
  errorMessage,
  onPasswordChange,
  onConfirm,
  onCancel,
}: {
  description?: string;
  confirmLabel: string;
  errorMessage?: string | null;
  onPasswordChange?: () => void;
  onConfirm: (password: string) => void | Promise<void>;
  onCancel: () => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ImportFormValues>({
    mode: "onChange",
    defaultValues: { password: "" },
  });

  const submit = handleSubmit(async ({ password }) => {
    setSubmitting(true);
    try {
      await onConfirm(password);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <View className="flex-col gap-4">
      <Typography variant="muted">{description}</Typography>

      {errorMessage ? (
        <Typography className="text-destructive-foreground" variant="p">
          {errorMessage}
        </Typography>
      ) : null}

      <Controller
        control={control}
        name="password"
        rules={{
          validate: (v) => v.length > 0 || "Password is required",
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="import-password">Password</Label>
            <Input
              value={value}
              onChangeText={(text) => {
                onPasswordChange?.();
                onChange(text);
              }}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              placeholder="Export password"
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
              <Typography>Importing…</Typography>
            </View>
          ) : (
            <Typography>{confirmLabel}</Typography>
          )}
        </Button>
      </View>
    </View>
  );
};
