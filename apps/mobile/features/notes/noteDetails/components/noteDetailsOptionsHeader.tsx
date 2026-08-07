import React, { useState } from "react";
import { View } from "react-native";
import { Button, Typography } from "@/components/ui";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import {
  FolderSelector,
  type FolderSelection,
} from "@/features/notes/notePreview/folderSelector";
import { PersonSelector } from "@/features/notes/notePreview/personSelector";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import { Icon } from "@/components/ui/icons/icon";
import { Person } from "@repo/zod-schemas";

type NoteDetailsOptionsHeaderProps = {
  folder: FolderSelection;
  onFolderSelect: (folder: FolderSelection) => void;
  persons: Person[];
  onPersonsChange: (persons: Person[]) => void;
  simplified: boolean;
  onSimplifiedChange: (simplified: boolean) => void;
  folderError?: boolean;
};

export function NoteDetailsOptionsHeader({
  folder,
  onFolderSelect,
  persons,
  onPersonsChange,
  simplified,
  onSimplifiedChange,
  folderError = false,
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
      <View className="flex-row flex-wrap items-center gap-3">
        <TriggerFilterChip
          icon="settings-2"
          selected={expanded}
          showDot={simplified}
          onPress={() => setExpanded((prev) => !prev)}
        />
        <FolderSelector
          selectedFolder={folder}
          onSelect={onFolderSelect}
          maxChars={18}
          allowRoot={false}
          error={folderError}
        />
        <PersonSelector
          selectedPersons={persons}
          onChange={onPersonsChange}
          maxChars={18}
        />
      </View>
    </PageOptionsHeaderContainer>
  );
}
