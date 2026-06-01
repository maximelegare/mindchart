import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { cn } from "@/lib/cn";

import { PROFILE_COLORS } from "../data/profileColors";

const PROFILE_COLOR_OPTIONS: { key: string; value: [string, string] }[] =
  Object.entries(PROFILE_COLORS).map(([key, value]) => ({
    key,
    value: value as [string, string],
  }));

// Curated subset of the icon registry that makes sense for a workspace.
const ICON_OPTIONS: IconName[] = [
  "activity",
  "book",
  "briefcase-business",
  "calendar",
  "headset",
  "house",
  "lock-keyhole",
  "mic",
  "palette",
  "piggy-bank",
  "plane",
  "rocket",
  "shopping-cart",
  "sparkles",
  "sprout",
  "target",
];

export type WorkspaceFormValues = {
  name: string;
  color: [string, string];
  icon?: IconName;
};

type Props = {
  initialName?: string;
  initialColor?: [string, string];
  initialIcon?: IconName;
  placeholder?: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (values: WorkspaceFormValues) => void;
  onCancel: () => void;
};

/**
 * Custom modal body to capture a workspace's name, color (required), and
 * icon (optional). Use as the `customContent` of `useModal().openModal`.
 */
export const WorkspaceEdit = ({
  initialName = "",
  initialColor,
  initialIcon,
  placeholder = "Workspace name",
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<WorkspaceFormValues>({
    mode: "onChange",
    defaultValues: {
      name: initialName,
      color: initialColor ?? PROFILE_COLOR_OPTIONS[0].value,
      icon: initialIcon,
    },
  });

  const submit = handleSubmit((values) => {
    const trimmed = values.name.trim();
    if (!trimmed) return;
    onConfirm({ name: trimmed, color: values.color, icon: values.icon });
  });

  return (
    <View className="flex-col gap-4">
      {description && <Typography variant="muted">{description}</Typography>}

      <Controller
        control={control}
        name="name"
        rules={{ validate: (v) => v.trim().length > 0 }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="workspace-name">Name</Label>
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="color"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <View className="flex-col gap-1">
            <Label nativeID="workspace-color">Color</Label>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {PROFILE_COLOR_OPTIONS.map(({ key, value: swatch }) => {
                const selected =
                  value[0] === swatch[0] && value[1] === swatch[1];
                return (
                  <View
                    key={key}
                    className={cn(
                      "rounded-lg p-0.5",
                      selected
                        ? "border-2 border-primary"
                        : "border-2 border-transparent"
                    )}
                  >
                    <Pressable
                      onPress={() => onChange(swatch)}
                      accessibilityRole="button"
                      accessibilityLabel={`Color ${key}`}
                      accessibilityState={{ selected }}
                      android_ripple={null}
                      className="overflow-hidden w-10 h-10 rounded-md"
                    >
                      <LinearGradient
                        colors={swatch}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      />

      <Controller
        control={control}
        name="icon"
        render={({ field: { value, onChange } }) => (
          <View className="flex-col gap-1">
            <View className="flex-row items-center justify-between">
              <Label nativeID="workspace-icon">Icon (optional)</Label>
              {value && (
                <Pressable
                  onPress={() => onChange(undefined)}
                  accessibilityRole="button"
                  accessibilityLabel="Clear icon"
                >
                  <Typography variant="muted" className="text-sm">
                    Clear
                  </Typography>
                </Pressable>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {ICON_OPTIONS.map((iconName) => {
                const selected = value === iconName;
                return (
                  <Pressable
                    key={iconName}
                    onPress={() => onChange(selected ? undefined : iconName)}
                    accessibilityRole="button"
                    accessibilityLabel={`Icon ${iconName}`}
                    className={cn(
                      "w-10 h-10 rounded-md items-center justify-center border",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-input bg-background"
                    )}
                  >
                    <Icon
                      name={iconName}
                      color={selected ? "primary" : "foreground"}
                      size={20}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      />

      <View className="flex-row justify-end gap-2 mt-2">
        <Button variant="default" onPress={onCancel}>
          <Typography>{cancelLabel}</Typography>
        </Button>
        <Button variant="default" disabled={!isValid} onPress={submit}>
          <Typography>{confirmLabel}</Typography>
        </Button>
      </View>
    </View>
  );
};
