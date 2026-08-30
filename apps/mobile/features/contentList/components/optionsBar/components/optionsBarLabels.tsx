import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Icon } from "@/components/ui/icons/icon";
import type {
  DisplayMode,
  FoldersMode,
  OptionsBar,
  SortDirection,
  SortField,
} from "../../../types";

type GroupBy = OptionsBar["groupBy"];

const chipLabelStyle = {
  fontFamily: "QuicksandRegular",
  fontSize: 12,
  lineHeight: 16,
  includeFontPadding: false,
  textAlignVertical: "center" as const,
};

function SortDirectionPhrase({
  from,
  to,
  color,
}: {
  from: ReactNode;
  to: ReactNode;
  color?: string;
}) {
  return (
    <View className="flex-row items-center" style={{ height: 16 }}>
      <Text style={[chipLabelStyle, color ? { color } : null]}>{from}</Text>
      <Icon
        name="chevron-right"
        color="muted-foreground"
        hslColor={color}
        size={12}
        style={{ marginHorizontal: 1, transform: [{ translateY: 1 }] }}
      />
      <Text style={[chipLabelStyle, color ? { color } : null]}>{to}</Text>
    </View>
  );
}

export function SortSheetTitle() {
  return <fbt desc="Options bar sort sheet title">Sort by</fbt>;
}

export function GroupSheetTitle() {
  return <fbt desc="Options bar group sheet title">Group by</fbt>;
}

export function SortFieldOptionLabel({ value }: { value: SortField }) {
  switch (value) {
    case "alphabetical":
      return <fbt desc="Sort field: alphabetical">Alphabetical</fbt>;
    case "lastViewed":
      return <fbt desc="Sort field: last viewed">Last viewed</fbt>;
    case "updatedAt":
      return <fbt desc="Sort field: last updated">Last updated</fbt>;
    case "createdAt":
      return <fbt desc="Sort field: date created">Date created</fbt>;
  }
}

export function SortDirectionChipLabel({
  value,
  color,
}: {
  value: SortDirection;
  color?: string;
}) {
  if (value === "asc") {
    return (
      <SortDirectionPhrase
        color={color}
        from={<fbt desc="Sort direction start: beginning">Beginning</fbt>}
        to={<fbt desc="Sort direction end: end">end</fbt>}
      />
    );
  }

  return (
    <SortDirectionPhrase
      color={color}
      from={<fbt desc="Sort direction start: end">End</fbt>}
      to={<fbt desc="Sort direction end: beginning">beginning</fbt>}
    />
  );
}

export function GroupOptionLabel({ value }: { value: GroupBy }) {
  switch (value) {
    case "folders":
      return <fbt desc="Group option: by folder">By folder</fbt>;
    case "categories":
      return <fbt desc="Group option: by category">By category</fbt>;
    case "dates":
      return <fbt desc="Group option: by date">By date</fbt>;
    case "none":
      return <fbt desc="Group option: no grouping">Not grouping</fbt>;
  }
}

export function GroupChipLabel({
  value,
  showPrefix,
}: {
  value: GroupBy;
  showPrefix: boolean;
}) {
  if (showPrefix) {
    return (
      <fbt desc="Group filter chip with selected grouping option">
        Group{" "}
        <fbt:param name="option">
          <GroupOptionLabel value={value} />
        </fbt:param>
      </fbt>
    );
  }

  return <GroupOptionLabel value={value} />;
}

export function FoldersModeChipLabel({ mode }: { mode: FoldersMode }) {
  if (mode === "with") {
    return <fbt desc="Folders mode: with folders">With folders</fbt>;
  }

  return <fbt desc="Folders mode: without folders">Without folders</fbt>;
}

export function DisplayModeChipLabel({ mode }: { mode: DisplayMode }) {
  if (mode === "notes") {
    return <fbt desc="Display mode: notes">Display Notes</fbt>;
  }

  return <fbt desc="Display mode: categories">Display Categories</fbt>;
}

export type OptionLabelRenderer<T extends string> = (value: T) => ReactNode;

export function renderSortFieldChipLabel(value: SortField) {
  return <SortFieldOptionLabel value={value} />;
}

export function renderGroupChipLabel(
  value: GroupBy,
  showGroupPrefix?: boolean
) {
  return <GroupChipLabel value={value} showPrefix={!!showGroupPrefix} />;
}
