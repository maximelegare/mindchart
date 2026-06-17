import { Button, Typography } from "@/components/ui";
import { Pressable, View } from "react-native";
import { DisplayMode, OptionsBar as OptionsBarType } from "../../../types";
import { Card } from "@/components/ui/card";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { useState } from "react";
import { Icon } from "@/components/ui/icons/icon";
import { Gutter } from "@/components/ui/gutter";
import { Separator } from "@/components/ui/separator";
import { H4 } from "@/components/ui/typography";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useOptionsBar } from "../context/optionBarContext";

const SORT_OPTIONS: {
  value: OptionsBarType["sortBy"];
  label: string;
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "A ➞ Z" },
  { value: "za", label: "Z ➞ A" },
];

const GROUP_OPTIONS: {
  value: OptionsBarType["groupBy"];
  label: string;
}[] = [
  { value: "topics", label: "By topic" },
  { value: "categories", label: "By category" },
  { value: "none", label: "None" },
];

const DISPLAY_MODE_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: "topics", label: "Topics" },
  { value: "categories", label: "Categories" },
];

const OVERVIEW_LABEL = "Note Overview";

type RadioOptionRowProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onValueChange: (value: T) => void;
  idPrefix: string;
};

function RadioOptionRow<T extends string>({
  options,
  value,
  onValueChange,
  idPrefix,
}: RadioOptionRowProps<T>) {
  return (
    <RadioGroup
      className="flex-col"
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
    >
      {options.map((option) => {
        const labelId = `${idPrefix}-${option.value}`;
        return (
          <View key={option.value} className="flex-row items-center gap-2">
            <RadioGroupItem aria-labelledby={labelId} value={option.value} />
            <Pressable onPress={() => onValueChange(option.value)}>
              <Typography nativeID={labelId} variant="p" className="text-sm">
                {option.label}
              </Typography>
            </Pressable>
          </View>
        );
      })}
    </RadioGroup>
  );
}

type DisplayOptionsProps = {
  displayMode: DisplayMode;
  showOverview: boolean;
  onDisplayModeChange: (value: DisplayMode) => void;
  onShowOverviewChange: (value: boolean) => void;
};

function DisplayOptions({
  displayMode,
  showOverview,
  onDisplayModeChange,
  onShowOverviewChange,
}: DisplayOptionsProps) {
  const notesSelected = displayMode === "notes";

  const onModeChange = (mode: DisplayMode) => {
    onDisplayModeChange(mode);
  };

  return (
    <RadioGroup
      className="flex-col gap-4"
      value={displayMode}
      onValueChange={(v) => onModeChange(v as DisplayMode)}
    >
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <RadioGroupItem aria-labelledby="display-notes" value="notes" />
          <Pressable onPress={() => onModeChange("notes")}>
            <Typography
              nativeID="display-notes"
              variant="p"
              className="text-sm"
            >
              Notes
            </Typography>
          </Pressable>
        </View>
        <View className="ml-3 border-l border-border pl-4">
          <View className="flex-row items-center gap-2">
            <Checkbox
              checked={showOverview}
              disabled={!notesSelected}
              onCheckedChange={(checked) => {
                if (notesSelected) onShowOverviewChange(checked);
              }}
            />
            <Pressable
              disabled={!notesSelected}
              onPress={() => {
                if (notesSelected) onShowOverviewChange(!showOverview);
              }}
            >
              <Typography
                nativeID="display-overview"
                variant="p"
                className={
                  notesSelected ? "text-sm" : "text-sm text-muted-foreground/50"
                }
              >
                {OVERVIEW_LABEL}
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>

      {DISPLAY_MODE_OPTIONS.map((option) => {
        const labelId = `display-${option.value}`;
        return (
          <View key={option.value} className="flex-row items-center gap-2">
            <RadioGroupItem aria-labelledby={labelId} value={option.value} />
            <Pressable onPress={() => onModeChange(option.value)}>
              <Typography nativeID={labelId} variant="p" className="text-sm">
                {option.label}
              </Typography>
            </Pressable>
          </View>
        );
      })}
    </RadioGroup>
  );
}

export const OptionsBar = () => {
  const [expanded, setExpanded] = useState(false);
  const handleSortByChange = useOptionsBar((state) => state.handleSortByChange);
  const handleGroupByChange = useOptionsBar(
    (state) => state.handleGroupByChange
  );
  const handleDisplayModeChange = useOptionsBar(
    (state) => state.handleDisplayModeChange
  );
  const handleShowOverviewChange = useOptionsBar(
    (state) => state.handleShowOverviewChange
  );

  const [sortBy, setSortBy] = useState(() => useOptionsBar.getState().sortBy);
  const [groupBy, setGroupBy] = useState(
    () => useOptionsBar.getState().groupBy
  );
  const [displayMode, setDisplayMode] = useState(
    () => useOptionsBar.getState().displayMode
  );
  const [showOverview, setShowOverview] = useState(
    () => useOptionsBar.getState().showOverview
  );

  const onSortByChange = (value: OptionsBarType["sortBy"]) => {
    setSortBy(value);
    handleSortByChange(value);
  };

  const onGroupByChange = (value: OptionsBarType["groupBy"]) => {
    setGroupBy(value);
    handleGroupByChange(value);
  };

  const onDisplayModeChange = (value: DisplayMode) => {
    setDisplayMode(value);
    handleDisplayModeChange(value);
  };

  const onShowOverviewChange = (value: boolean) => {
    setShowOverview(value);
    handleShowOverviewChange(value);
  };

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? sortBy;
  const groupLabel =
    GROUP_OPTIONS.find((o) => o.value === groupBy)?.label ?? groupBy;

  return (
    <Card className="border-border" style={{ marginBottom: 10 }}>
      <Gutter size="md" className="py-2">
        <View className="flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-row items-center gap-2"
            onPress={() => setExpanded(!expanded)}
          >
            <Icon name="sliders-horizontal" color="text" size={16} />
            <Icon
              name={expanded ? "chevron-up" : "chevron-down"}
              color="text"
              size={20}
            />
          </Button>

          <View className="flex-1 flex-row flex-wrap justify-end gap-1.5">
            <View className="rounded-full border border-border bg-background px-2.5 py-0.5">
              <Typography variant="p" className="text-xs text-muted-foreground">
                {sortLabel}
              </Typography>
            </View>
            <View className="rounded-full border border-border bg-background px-2.5 py-0.5">
              <Typography variant="p" className="text-xs text-muted-foreground">
                {groupLabel}
              </Typography>
            </View>
          </View>
        </View>

        <CollapsibleContainer expanded={expanded}>
          <View className="gap-4 pt-3">
            <Separator />
            <View className="gap-2">
              <H4>Sort by</H4>
              <View style={{ paddingLeft: 10 }}>
                <RadioOptionRow
                  idPrefix="sort"
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onValueChange={onSortByChange}
                />
              </View>
            </View>
            <View className="gap-2">
              <H4>Group by</H4>
              <View style={{ paddingLeft: 10 }}>
                <RadioOptionRow
                  idPrefix="group"
                  options={GROUP_OPTIONS}
                  value={groupBy}
                  onValueChange={onGroupByChange}
                />
              </View>
            </View>
            <View className="gap-2">
              <H4>Display</H4>
              <View style={{ paddingLeft: 10 }}>
                <DisplayOptions
                  displayMode={displayMode}
                  showOverview={showOverview}
                  onDisplayModeChange={onDisplayModeChange}
                  onShowOverviewChange={onShowOverviewChange}
                />
              </View>
            </View>
          </View>
        </CollapsibleContainer>
      </Gutter>
    </Card>
  );
};
