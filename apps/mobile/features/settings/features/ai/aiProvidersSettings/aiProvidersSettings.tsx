import React from "react";
import { useAISettingsPreferences } from "@/features/settings/context/ai";
import { Typography } from "@/components/ui/typography";
import { AIProviderKeys, AIProviderType } from "../types/ai";
import { Gutter } from "@/components/ui/gutter";
import { View } from "react-native";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/cn";

export const AiProvidersSettings = () => {
  const { aiProviders, setAIProviders } = useAISettingsPreferences();

  const providerRows: Array<
    { key: AIProviderKeys; label: string } & { disabled: boolean }
  > = [
    { key: "whisper", label: "Whisper", disabled: true },
    { key: "llamaChat", label: "Llama Chat", disabled: true },
    { key: "embeddings", label: "Embeddings", disabled: true },
  ];

  const providerOptions: Array<{ label: string; value: AIProviderType }> = [
    { label: "Local", value: "local" },
    { label: "Cloud", value: "cloud" },
  ];

  return (
    <Gutter size="none" className="py-3 mt-4">
      <Typography variant="p" padding>
        The AI providers are the locations where the AI models are hosted.
      </Typography>

      {providerRows.map((row) => (
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
              setAIProviders({ [row.key]: value as AIProviderType })
            }
          >
            {providerOptions.map((option) => {
              const labelId = `${row.key}-${option.value}`;
              return (
                <View
                  key={labelId}
                  className="flex-row items-center gap-2"
                  onTouchStart={() =>
                    row.disabled
                      ? undefined
                      : setAIProviders({
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
    </Gutter>
  );
};
