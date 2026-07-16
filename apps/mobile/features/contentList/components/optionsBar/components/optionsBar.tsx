import React, { useState } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DisplayMode, OptionsBar as OptionsBarType } from "../../../types";
import { useOptionsBar } from "../context/optionBarContext";
import { ContentListFilterChips, FilterChip } from "./filterChips";

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

const DISPLAY_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: "notes", label: "Notes" },
  { value: "topics", label: "Topics" },
  { value: "categories", label: "Categories" },
];

type OptionsDropdownProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onValueChange: (value: T) => void;
  footer?: React.ReactNode;
};

function OptionsDropdown<T extends string>({
  value,
  options,
  onValueChange,
  footer,
}: OptionsDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <FilterChip label={selectedLabel} selected={open} />
      </DropdownMenuTrigger>

      {open ? (
        <DropdownMenuContent
          forceMount
          side="bottom"
          align="start"
          className="mt-1 min-w-[10rem] border border-border bg-background pb-2 shadow-md"
        >
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onValueChange(next as T)}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Typography variant="p" className="text-md text-foreground">
                  {option.label}
                </Typography>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {footer ? (
            <>
              <DropdownMenuSeparator />
              {footer}
            </>
          ) : null}
        </DropdownMenuContent>
      ) : null}
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
    if (value !== "none") {
      setDisplayMode("notes");
    }
  };

  const onDisplayModeChange = (value: DisplayMode) => {
    setDisplayMode(value);
    handleDisplayModeChange(value);
  };

  const onShowOverviewChange = (value: boolean) => {
    setShowOverview(value);
    handleShowOverviewChange(value);
  };

  const funnelToggle = (
    <FilterChip
      icon="funnel"
      selected={expanded}
      onPress={() => setExpanded((prev) => !prev)}
    />
  );

  return (
    <PageOptionsHeaderContainer
      footer={
        <CollapsibleContainer expanded={expanded}>
          <View className="mx-2 mb-2 flex-row items-center gap-2 rounded-full px-2.5 py-1.5">
            <OptionsDropdown
              value={sortBy}
              options={SORT_OPTIONS}
              onValueChange={onSortByChange}
            />
            <OptionsDropdown
              value={groupBy}
              options={GROUP_OPTIONS}
              onValueChange={onGroupByChange}
            />
            <OptionsDropdown
              value={displayMode}
              options={DISPLAY_OPTIONS}
              onValueChange={onDisplayModeChange}
              footer={
                <DropdownMenuCheckboxItem
                  checked={displayMode === "notes" && showOverview}
                  disabled={displayMode !== "notes"}
                  onCheckedChange={(checked) => {
                    if (displayMode !== "notes") return;
                    onShowOverviewChange(checked);
                  }}
                >
                  <Typography
                    variant="p"
                    className={
                      displayMode === "notes"
                        ? "text-sm text-popover-foreground"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    Overview
                  </Typography>
                </DropdownMenuCheckboxItem>
              }
            />
          </View>
        </CollapsibleContainer>
      }
    >
      <ContentListFilterChips leading={funnelToggle} />
    </PageOptionsHeaderContainer>
  );
};
