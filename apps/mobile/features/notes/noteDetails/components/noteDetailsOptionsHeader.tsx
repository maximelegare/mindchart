import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Typography } from "@/components/ui";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import {
  FolderSelector,
  type FolderSelection,
} from "@/features/notes/shared/ui/folderSelector";
import { PersonSelector } from "@/features/notes/shared/ui/personSelector";
import { FeelingSelector } from "@/features/notes/shared/ui/feelingSelector";
import { LocationSelector } from "@/features/notes/shared/ui/locationSelector";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import { Icon } from "@/components/ui/icons/icon";
import { Person } from "@repo/zod-schemas";
import type { FeelingValue, Location } from "@repo/zod-schemas/src/schemas";
import {
  NoteDetailsCompleteViewLabel,
  NoteDetailsSimplifiedViewLabel,
} from "@/features/notes/noteDetails/noteDetailsLabels";

type NoteDetailsOptionsHeaderProps = {
  folder: FolderSelection;
  onFolderSelect: (folder: FolderSelection) => void;
  persons: Person[];
  onPersonsChange: (persons: Person[]) => void;
  feeling: FeelingValue | null;
  onFeelingChange: (feeling: FeelingValue | null) => void;
  locationId: string | null;
  locationName: string | null;
  onLocationChange: (location: Location | null) => void;
  simplified: boolean;
  onSimplifiedChange: (simplified: boolean) => void;
  folderError?: boolean;
};

export function NoteDetailsOptionsHeader({
  folder,
  onFolderSelect,
  persons,
  onPersonsChange,
  feeling,
  onFeelingChange,
  locationId,
  locationName,
  onLocationChange,
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
                {simplified ? (
                  <NoteDetailsCompleteViewLabel />
                ) : (
                  <NoteDetailsSimplifiedViewLabel />
                )}
              </Typography>
            </Button>
          </View>
        </CollapsibleContainer>
      }
    >
      <View className="w-full flex-row items-center gap-3">
        <View className="shrink-0">
          <TriggerFilterChip
            icon="settings-2"
            selected={expanded}
            showDot={simplified}
            onPress={() => setExpanded((prev) => !prev)}
          />
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
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
            maxChars={12}
          />
          <FeelingSelector
            selectedFeeling={feeling}
            onChange={onFeelingChange}
          />
          <LocationSelector
            selectedLocationId={locationId}
            selectedLocationName={locationName}
            onChange={onLocationChange}
            maxChars={16}
          />
        </ScrollView>
      </View>
    </PageOptionsHeaderContainer>
  );
}
