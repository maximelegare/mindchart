import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { Gutter } from "@/components/ui/gutter";
import {
  FolderSelector,
  type FolderSelection,
} from "@/features/notes/shared/ui/folderSelector";
import { PersonSelector } from "@/features/notes/shared/ui/personSelector";
import { FeelingSelector } from "@/features/notes/shared/ui/feelingSelector";
import { LocationSelector } from "@/features/notes/shared/ui/locationSelector";
import { TriggerFilterChip } from "@/features/contentList/components/optionsBar/components/triggerFilterChip";
import { OptionChip } from "@/features/contentList/components/optionsBar/components/options/optionChip";
import { type FeelingValue, type Location, Person } from "@repo/zod-schemas";

import { NoteDetailsViewModeChipLabel } from "@/features/notes/noteDetails/noteDetailsLabels";
import { useNoteDetailsViewStore } from "@/features/notes/noteDetails/context/noteDetailsViewContext";

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
  folderError = false,
}: NoteDetailsOptionsHeaderProps) {
  const [expanded, setExpanded] = useState(true);
  const simplified = useNoteDetailsViewStore((state) => state.simplified);
  const toggleSimplified = useNoteDetailsViewStore(
    (state) => state.toggleSimplified
  );

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <Gutter size="md" className="mb-2">
            <View
              className="flex-row flex-wrap items-center py-3"
              style={{ rowGap: 12, columnGap: 8 }}
            >
              <OptionChip
                icon={simplified ? "eye-off" : "eye"}
                label={<NoteDetailsViewModeChipLabel simplified={simplified} />}
                selected={!simplified}
                muted={simplified}
                onPress={toggleSimplified}
              />
            </View>
          </Gutter>
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
