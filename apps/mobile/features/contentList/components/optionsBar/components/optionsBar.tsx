import { Button, Typography } from "@/components/ui";
import { Pressable, View } from "react-native";
import { OptionsBar as OptionsBarType } from "../../../types";
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

const TOP_LEVEL_DISPLAY_OPTIONS: {
  value: Exclude<OptionsBarType["display"][number], "overview">;
  label: string;
}[] = [
  { value: "topics", label: "Topics" },
  { value: "categories", label: "Categories" },
];

const OVERVIEW_OPTION = { value: "overview" as const, label: "Note Overview" };

const normalizeDisplay = (
  display: OptionsBarType["display"]
): OptionsBarType["display"] =>
  display.includes("notes")
    ? display
    : display.filter((item) => item !== "overview");

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

type DisplayCheckboxesProps = {
  value: OptionsBarType["display"];
  onValueChange: (value: OptionsBarType["display"]) => void;
};

type DisplayItem = OptionsBarType["display"][number];

function DisplayCheckboxRow({
  labelId,
  label,
  checked,
  disabled = false,
  onToggle,
  className,
}: {
  labelId: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <View className={className}>
      <View className="flex-row items-center gap-2">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onCheckedChange={() => {
            if (!disabled) onToggle();
          }}
        />
        <Pressable disabled={disabled} onPress={onToggle}>
          <Typography
            nativeID={labelId}
            variant="p"
            className={
              disabled ? "text-sm text-muted-foreground/50" : "text-sm"
            }
          >
            {label}
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

function DisplayCheckboxes({ value, onValueChange }: DisplayCheckboxesProps) {
  const notesChecked = value.includes("notes");
  const overviewChecked = value.includes("overview");

  const toggle = (item: DisplayItem) => {
    if (item === "notes") {
      if (value.includes("notes")) {
        onValueChange(value.filter((v) => v !== "notes" && v !== "overview"));
      } else {
        onValueChange([...value, "notes", "overview"]);
      }
      return;
    }

    if (item === "overview") {
      if (!notesChecked) return;
      if (value.includes("overview")) {
        onValueChange(value.filter((v) => v !== "overview"));
      } else {
        onValueChange([...value, "overview"]);
      }
      return;
    }

    if (value.includes(item)) {
      onValueChange(value.filter((v) => v !== item));
    } else {
      onValueChange([...value, item]);
    }
  };

  return (
    <View className="flex-col gap-4">
      <View className="gap-2">
        <DisplayCheckboxRow
          labelId="display-notes"
          label="Notes"
          checked={notesChecked}
          onToggle={() => toggle("notes")}
        />
        <View className="ml-3 border-l border-border pl-4">
          <DisplayCheckboxRow
            labelId="display-overview"
            label={OVERVIEW_OPTION.label}
            checked={overviewChecked}
            disabled={!notesChecked}
            onToggle={() => toggle("overview")}
          />
        </View>
      </View>

      {TOP_LEVEL_DISPLAY_OPTIONS.map((option) => {
        const labelId = `display-${option.value}`;
        const checked = value.includes(option.value);
        return (
          <DisplayCheckboxRow
            key={option.value}
            labelId={labelId}
            label={option.label}
            checked={checked}
            onToggle={() => toggle(option.value)}
          />
        );
      })}
    </View>
  );
}

export const OptionsBar = () => {
  const [expanded, setExpanded] = useState(false);
  const handleSortByChange = useOptionsBar((state) => state.handleSortByChange);
  const handleGroupByChange = useOptionsBar(
    (state) => state.handleGroupByChange
  );
  const handleDisplayChange = useOptionsBar(
    (state) => state.handleDisplayChange
  );

  const [sortBy, setSortBy] = useState(() => useOptionsBar.getState().sortBy);
  const [groupBy, setGroupBy] = useState(
    () => useOptionsBar.getState().groupBy
  );
  const [display, setDisplay] = useState(
    () => useOptionsBar.getState().display
  );

  const onSortByChange = (value: OptionsBarType["sortBy"]) => {
    setSortBy(value);
    handleSortByChange(value);
  };

  const onGroupByChange = (value: OptionsBarType["groupBy"]) => {
    setGroupBy(value);
    handleGroupByChange(value);
  };

  const onDisplayChange = (value: OptionsBarType["display"]) => {
    const normalized = normalizeDisplay(value);
    setDisplay(normalized);
    handleDisplayChange(normalized);
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
                <DisplayCheckboxes
                  value={display}
                  onValueChange={onDisplayChange}
                />
              </View>
            </View>
          </View>
        </CollapsibleContainer>
      </Gutter>
    </Card>
  );
};
