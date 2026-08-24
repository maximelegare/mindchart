import { Button, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalTitle } from "@/components/ui/modal/components/modalTitle";
import { useModal } from "@/components/ui/modal/modal";
import { BottomSheetTextInput } from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, View } from "react-native";
import {
  FolderFormCancelLabel,
  FolderFormCreateButtonLabel,
  FolderFormCreatingButtonLabel,
  FolderFormNameLabel,
  FolderFormSaveButtonLabel,
  FolderFormSavingButtonLabel,
  FolderFormTitle,
  folderFormCreateFailedAlertTitle,
  folderFormNamePlaceholder,
  folderFormNameRequiredError,
  folderFormRenameFailedAlertTitle,
} from "./folderFormLabels";

type FolderFormModalContentProps = {
  mode: "create" | "rename";
  initialLabel?: string;
  onSave: (label: string) => Promise<void>;
  /** Prefer this over the modal close when hosting in a bottom sheet. */
  onClose?: () => void;
  inBottomSheet?: boolean;
  disableSubmit?: boolean;
};

type FolderFormValues = {
  label: string;
};

export const FolderFormModalContent = ({
  mode,
  initialLabel = "",
  onSave,
  onClose,
  inBottomSheet = false,
  disableSubmit = false,
}: FolderFormModalContentProps) => {
  const modal = useModal();
  const close = onClose ?? modal.closeModal;
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<FolderFormValues>({
    mode: "onChange",
    defaultValues: {
      label: initialLabel,
    },
  });

  const submit = handleSubmit(async (values) => {
    if (disableSubmit) return;
    const trimmed = values.label.trim();
    if (!trimmed) return;
    if (mode === "rename" && trimmed === initialLabel) return;

    setErrorMessage(null);
    setIsPending(true);
    try {
      await onSave(trimmed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
      Alert.alert(
        mode === "create"
          ? folderFormCreateFailedAlertTitle()
          : folderFormRenameFailedAlertTitle(),
        message
      );
    } finally {
      setIsPending(false);
    }
  });

  return (
    <View className="flex-col gap-4">
      {!inBottomSheet ? (
        <ModalTitle title={<FolderFormTitle mode={mode} />} />
      ) : null}

      {errorMessage ? (
        <Typography className="text-foreground-errors" variant="p">
          {errorMessage}
        </Typography>
      ) : null}

      <Controller
        control={control}
        name="label"
        rules={{
          validate: (v) => v.trim().length > 0 || folderFormNameRequiredError(),
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="folder-label">
              <FolderFormNameLabel />
            </Label>
            {inBottomSheet ? (
              <BottomSheetTextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={folderFormNamePlaceholder()}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            ) : (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={folderFormNamePlaceholder()}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={submit}
              />
            )}
          </View>
        )}
      />

      <View className="flex-row justify-end gap-2 mt-2 items-center">
        <Button variant="default" onPress={close} disabled={isPending}>
          <Typography>
            <FolderFormCancelLabel />
          </Typography>
        </Button>
        <Button
          variant="default"
          disabled={
            disableSubmit ||
            !isValid ||
            isPending ||
            (mode === "rename" ? !isDirty : false)
          }
          onPress={submit}
        >
          {isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Typography>
                {mode === "create" ? (
                  <FolderFormCreatingButtonLabel />
                ) : (
                  <FolderFormSavingButtonLabel />
                )}
              </Typography>
            </View>
          ) : (
            <Typography>
              {mode === "create" ? (
                <FolderFormCreateButtonLabel />
              ) : (
                <FolderFormSaveButtonLabel />
              )}
            </Typography>
          )}
        </Button>
      </View>
    </View>
  );
};
