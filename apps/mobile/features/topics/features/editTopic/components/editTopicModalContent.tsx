import { Button, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalTitle } from "@/components/ui/modal/components/modalTitle";
import { useModal } from "@/components/ui/modal/modal";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, View } from "react-native";

type EditTopicModalContentProps = {
  topic: TopicWithNotesInfos;
  onSave: (name: string) => Promise<void>;
};

type TopicFormValues = {
  name: string;
};

export const EditTopicModalContent = ({
  topic,
  onSave,
}: EditTopicModalContentProps) => {
  const { closeModal } = useModal();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<TopicFormValues>({
    mode: "onChange",
    defaultValues: {
      name: topic.name,
    },
  });

  const submit = handleSubmit(async (values) => {
    const trimmed = values.name.trim();
    if (!trimmed || trimmed === topic.name) return;

    setErrorMessage(null);
    setIsPending(true);
    try {
      await onSave(trimmed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
      Alert.alert("Update failed", message);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <View className="flex-col gap-4">
      <ModalTitle title="Edit topic" />

      {errorMessage ? (
        <Typography className="text-destructive-foreground" variant="p">
          {errorMessage}
        </Typography>
      ) : null}

      <Controller
        control={control}
        name="name"
        rules={{ validate: (v) => v.trim().length > 0 || "Name is required" }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="topic-name">Name</Label>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Topic name"
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>
        )}
      />

      <View className="flex-row justify-end gap-2 mt-2 items-center">
        <Button variant="default" onPress={closeModal} disabled={isPending}>
          <Typography>Cancel</Typography>
        </Button>
        <Button
          variant="default"
          disabled={!isValid || !isDirty || isPending}
          onPress={submit}
        >
          {isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Typography>Saving…</Typography>
            </View>
          ) : (
            <Typography>Save</Typography>
          )}
        </Button>
      </View>
    </View>
  );
};
