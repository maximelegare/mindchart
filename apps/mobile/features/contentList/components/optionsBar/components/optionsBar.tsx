import React, { useState } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icons/icon";
import { IconName } from "@/components/ui/icons/icon-registry";
import { DisplayMode, OptionsBar as OptionsBarType } from "../../../types";
import {
  OPTIONS_BAR_DEFAULTS,
  useOptionsBar,
} from "../context/optionBarContext";
import { ContentListFilterChips, FilterChip } from "./filterChips";
import { FunnelFilterChip } from "./funnelFilterChip";

type OptionItem<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

const SORT_OPTIONS: OptionItem<OptionsBarType["sortBy"]>[] = [
  { icon: "arrow-down-wide-narrow", value: "newest", label: "Newest first" },
  { icon: "arrow-up-narrow-wide", value: "oldest", label: "Oldest first" },
  { icon: "arrow-down-a-z", value: "az", label: "Alphabetical" },
  { icon: "arrow-up-a-z", value: "za", label: "Z to A order" },
];

const GROUP_OPTIONS: OptionItem<OptionsBarType["groupBy"]>[] = [
  { icon: "tag", value: "topics", label: "By topic" },
  { icon: "shapes", value: "categories", label: "By category" },
  { icon: "circle-off", value: "none", label: "None" },
];

const DISPLAY_OPTIONS: OptionItem<DisplayMode>[] = [
  { icon: "notebook-text", value: "notes", label: "Notes" },
  { icon: "tag", value: "topics", label: "Topics" },
  { icon: "layers", value: "categories", label: "Categories" },
];

type OptionsDropdownProps<T extends string> = {
  title: string;
  value: T;
  options: OptionItem<T>[];
  onValueChange: (value: T) => void;
};

function OptionsDropdown<T extends string>({
  title,
  value,
  options,
  onValueChange,
}: OptionsDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? value;
  const selectedIcon = selected?.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <FilterChip icon={selectedIcon} label={selectedLabel} selected={open} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        className=" border border-border bg-popover pb-2 shadow-md"
        style={{ minWidth: 160, marginTop: 8 }}
      >
        <DropdownMenuLabel className="px-3 py-1.5 text-xs text-muted-foreground native:text-sm">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onValueChange(next as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="flex-row items-center gap-2"
            >
              {option.icon ? (
                <Icon name={option.icon} color="popover-foreground" size={16} />
              ) : null}
              <Typography
                variant="p"
                className="text-md text-popover-foreground"
              >
                {option.label}
              </Typography>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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

  const [sortBy, setSortBy] = useState(() => useOptionsBar.getState().sortBy);
  const [groupBy, setGroupBy] = useState(
    () => useOptionsBar.getState().groupBy
  );
  const [displayMode, setDisplayMode] = useState(
    () => useOptionsBar.getState().displayMode
  );

  const onSortByChange = (value: OptionsBarType["sortBy"]) => {
    setSortBy(value);
    handleSortByChange(value);
  };

  const onGroupByChange = (value: OptionsBarType["groupBy"]) => {
    setGroupBy(value);
    handleGroupByChange(value);
    if (value !== "none") {
      setDisplayMode("notes");
    }
  };

  const onDisplayModeChange = (value: DisplayMode) => {
    setDisplayMode(value);
    handleDisplayModeChange(value);
  };

  const hasNonDefaultOptions =
    sortBy !== OPTIONS_BAR_DEFAULTS.sortBy ||
    groupBy !== OPTIONS_BAR_DEFAULTS.groupBy ||
    displayMode !== OPTIONS_BAR_DEFAULTS.displayMode;

  const funnelToggle = (
    <FunnelFilterChip
      icon="funnel"
      selected={expanded}
      showDot={hasNonDefaultOptions}
      onPress={() => setExpanded((prev) => !prev)}
    />
  );

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <View className="mx-2 mb-2 flex-row items-center gap-2 rounded-full px-2.5 py-1.5">
            <OptionsDropdown
              title="Sort by:"
              value={sortBy}
              options={SORT_OPTIONS}
              onValueChange={onSortByChange}
            />
            <OptionsDropdown
              title="Group by:"
              value={groupBy}
              options={GROUP_OPTIONS}
              onValueChange={onGroupByChange}
            />
            <OptionsDropdown
              title="Display:"
              value={displayMode}
              options={DISPLAY_OPTIONS}
              onValueChange={onDisplayModeChange}
            />
          </View>
        </CollapsibleContainer>
      }
    >
      <ContentListFilterChips leading={funnelToggle} />
    </PageOptionsHeaderContainer>
  );
};
