import React, { useState } from "react";
import { View } from "react-native";
import { Topic } from "@repo/zod-schemas";
import { Button, Typography } from "@/components/ui";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { TopicSelector } from "@/features/notes/notePreview/topicSelector";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import { Icon } from "@/components/ui/icons/icon";

type NoteDetailsOptionsHeaderProps = {
  topic: Topic | null;
  onTopicSelect: (topic: Topic) => void;
  simplified: boolean;
  onSimplifiedChange: (simplified: boolean) => void;
};

export function NoteDetailsOptionsHeader({
  topic,
  onTopicSelect,
  simplified,
  onSimplifiedChange,
}: NoteDetailsOptionsHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <View className="flex-row">
            <Button
              variant="ghost"
              className="mx-2 mb-2 flex-row items-center gap-2 rounded-full px-2.5 py-1.5"
              onPress={() => onSimplifiedChange(!simplified)}
            >
              <Icon name="eye" color="foreground" size={20} />
              <Typography
                variant="h4"
                className="text-sm text-muted-foreground"
                numberOfLines={1}
              >
                {simplified ? "Complete View" : "Simplified View"}
              </Typography>
            </Button>
          </View>
        </CollapsibleContainer>
      }
    >
      <View className="flex-row items-center gap-3">
        <TriggerFilterChip
          icon="settings-2"
          selected={expanded}
          showDot={simplified}
          onPress={() => setExpanded((prev) => !prev)}
        />
        {topic ? (
          <TopicSelector
            selectedTopic={topic}
            onSelect={onTopicSelect}
            maxChars={22}
          />
        ) : null}
      </View>
    </PageOptionsHeaderContainer>
  );
}
