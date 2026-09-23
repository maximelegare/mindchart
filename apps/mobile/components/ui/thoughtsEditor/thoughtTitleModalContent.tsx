import { Button, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalTitle } from "@/components/ui/modal/components/modalTitle";
import { useModal } from "@/components/ui/modal/modal";
import { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import {
  ThoughtsEditorTitleCancelLabel,
  ThoughtsEditorTitleModalTitle,
  ThoughtsEditorTitleSaveLabel,
  thoughtsEditorNoTitleYet,
  thoughtsEditorTitleLabel,
} from "./thoughtsEditorLabels";

type ThoughtTitleModalContentProps = {
  initialTitle: string;
  onSave: (title: string) => void;
};

export function ThoughtTitleModalContent({
  initialTitle,
  onSave,
}: ThoughtTitleModalContentProps) {
  const { closeModal } = useModal();
  const inputRef = useRef<TextInput>(null);
  const [title, setTitle] = useState(initialTitle);
  const placeholder = thoughtsEditorNoTitleYet();

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  const save = () => {
    onSave(title);
    closeModal();
  };

  return (
    <View className="flex-col gap-4">
      <ModalTitle title={<ThoughtsEditorTitleModalTitle />} />

      <View className="flex-col gap-1">
        <Label nativeID="thought-title">{thoughtsEditorTitleLabel()}</Label>
        <Input
          ref={inputRef}
          value={title}
          onChangeText={setTitle}
          placeholder={placeholder}
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={save}
          accessibilityLabelledBy="thought-title"
        />
      </View>

      <View className="flex-row justify-end gap-2 mt-2 items-center">
        <Button variant="default" onPress={closeModal}>
          <Typography>
            <ThoughtsEditorTitleCancelLabel />
          </Typography>
        </Button>
        <Button variant="default" onPress={save}>
          <Typography>
            <ThoughtsEditorTitleSaveLabel />
          </Typography>
        </Button>
      </View>
    </View>
  );
}
