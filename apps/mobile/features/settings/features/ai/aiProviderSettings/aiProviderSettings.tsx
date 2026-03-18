import React from "react";
import { useSettingsStore } from "@/features/settings/context/settings";
import { Typography } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIProvider } from "../types/ai";
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";

export const AiProviderSettings = () => {
  const { aiProvider, setAiProvider } = useSettingsStore();

  const aiProviders: Array<{ label: string; value: AIProvider }> = [
    { label: "Local", value: "local" },
    { label: "Cloud", value: "cloud" },
  ];

  const onSelect = (value: AIProvider) => {
    setAiProvider(value);
  };

  return (
    <Card>
      <Gutter size="md" className="py-3">
        <Typography variant="h3" padding>
          AI Provider
        </Typography>
        <Select
          value={
            aiProvider ? { label: aiProvider, value: aiProvider } : undefined
          }
          onValueChange={(option) => onSelect(option?.value as AIProvider)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an AI mode" />
          </SelectTrigger>
          <SelectContent>
            {aiProviders.map((mode) => (
              <SelectItem
                key={mode.value}
                label={mode.label}
                value={mode.value}
              >
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Gutter>
    </Card>
  );
};
