import React from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { AIProviderKeys, AIProviders, AIProviderType } from "../types/ai";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/cn";
import {
  SettingsAiProviderEmbeddingsLabel,
  SettingsAiProviderLlamaChatLabel,
  SettingsAiProviderWhisperLabel,
  SettingsAiProvidersDescription,
  settingsAiProviderCloud,
  settingsAiProviderLocal,
} from "@/features/settings/features/ai/labels/settingsAiLabels";

export type AiProvidersSettingsContentProps = {
  aiProviders: AIProviders;
  onChangeProviders: (
    providers:
      | Partial<AIProviders>
      | ((previousProviders: AIProviders) => AIProviders)
  ) => void;
};

const PROVIDER_ROWS: Array<{
  key: AIProviderKeys;
  label: React.ReactNode;
  disabled: boolean;
}> = [
  {
    key: "whisper",
    label: <SettingsAiProviderWhisperLabel />,
    disabled: true,
  },
  {
    key: "llamaChat",
    label: <SettingsAiProviderLlamaChatLabel />,
    disabled: true,
  },
  {
    key: "embeddings",
    label: <SettingsAiProviderEmbeddingsLabel />,
    disabled: true,
  },
];

export function AiProvidersSettingsContent({
  aiProviders,
  onChangeProviders,
}: AiProvidersSettingsContentProps) {
  return (
    <View className="gap-3 py-2">
      <Typography variant="p" padding>
        <SettingsAiProvidersDescription />
      </Typography>

      {PROVIDER_ROWS.map((row) => (
        <View
          key={row.key}
          className="flex-row items-center justify-between py-2"
        >
          <Typography variant="h4" className={cn(row.disabled && "opacity-50")}>
            {row.label}
          </Typography>
          <RadioGroup
            className="flex-row gap-4"
            value={aiProviders[row.key]}
            onValueChange={(value) =>
              onChangeProviders({ [row.key]: value as AIProviderType })
            }
          >
            {[
              { label: settingsAiProviderLocal(), value: "local" as const },
              { label: settingsAiProviderCloud(), value: "cloud" as const },
            ].map((option) => {
              const labelId = `${row.key}-${option.value}`;
              return (
                <View
                  key={labelId}
                  className="flex-row items-center gap-2"
                  onTouchStart={() =>
                    row.disabled
                      ? undefined
                      : onChangeProviders({
                          [row.key]: option.value as AIProviderType,
                        })
                  }
                >
                  <RadioGroupItem
                    aria-labelledby={labelId}
                    value={option.value}
                    disabled={row.disabled}
                  />
                  <Typography
                    className={cn("text-xs", row.disabled && "opacity-50")}
                    nativeID={labelId}
                    variant="p"
                  >
                    {option.label}
                  </Typography>
                </View>
              );
            })}
          </RadioGroup>
        </View>
      ))}
    </View>
  );
}
