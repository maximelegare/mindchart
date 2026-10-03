import { Fragment, memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { CardTitleRow, pushNoteDetails } from "../shared/cardTitleRow";
import { NoteBottomSheet } from "@/features/notes/noteBottomSheet";
import {
  CHECKBOX_MARK_SIZE,
  StaticCheckboxMark,
} from "../shared/staticCheckboxMark";
import {
  getThoughtPlainText,
  isTextLikeType,
  parseTextContentStyle,
  type ThoughtType,
} from "@repo/zod-schemas";
import { stripHtml } from "@/components/ui/thoughtsEditor";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { Icon } from "@/components/ui/icons/icon";

const MAX_VISIBLE_BULLETS = 4;

const BULLET_SIZE = 6;
const TEXT_LINE_HEIGHT = 18;

const COMPACT_GAP = 4;
const TYPE_CHANGE_GAP = 8;
const PARAGRAPH_GAP = 14;

export type NoteOverviewItem = {
  type: ThoughtType;
  text: string;
  style?: "block" | "inline";
  isCompleted?: boolean;
  markerColor?: string;
};

export function thoughtToOverviewItem(thought: {
  title?: string | null;
  type?: ThoughtType;
  content?: {
    text?: string;
    checked?: boolean;
    style?: string;
  };
  summary?: string | null;
  isCompletable?: boolean;
  isCompleted?: boolean;
}): NoteOverviewItem {
  const type = thought.type ?? "text";

  const text = stripHtml(
    thought.content?.text ||
      thought.summary ||
      thought.title ||
      (thought.content
        ? getThoughtPlainText({ content: thought.content })
        : "") ||
      ""
  );

  const isCompleted =
    type === "checkbox"
      ? Boolean(thought.content?.checked)
      : Boolean(thought.isCompleted);

  return {
    type,
    text,
    style: isTextLikeType(type)
      ? parseTextContentStyle(thought.content?.style)
      : undefined,
    isCompleted,
  };
}

type ThoughtOverviewItemProps = {
  item: NoteOverviewItem;
  markerColor: string;
};

const ThoughtOverviewItem = memo(
  ({ item, markerColor }: ThoughtOverviewItemProps) => {
    const isParagraph = isTextLikeType(item.type);
    const isCheckbox = item.type === "checkbox";
    const isCompleted = isCheckbox && Boolean(item.isCompleted);

    return (
      <View className="flex-row items-start">
        {!isParagraph && (
          <View
            className="ml-1"
            style={{
              width: CHECKBOX_MARK_SIZE,
              minHeight: TEXT_LINE_HEIGHT,
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCheckbox ? (
              <StaticCheckboxMark completed={Boolean(item.isCompleted)} />
            ) : (
              <View
                className="rounded-full"
                style={{
                  width: BULLET_SIZE,
                  height: BULLET_SIZE,
                  backgroundColor: item.markerColor ?? markerColor,
                }}
              />
            )}
          </View>
        )}

        <View
          className={
            isParagraph && item.style === "inline" ? undefined : "flex-1"
          }
        >
          <Typography
            variant="p"
            padding={false}
            style={{
              lineHeight: TEXT_LINE_HEIGHT,
              includeFontPadding: false,
              ...(isCompleted
                ? {
                    textDecorationLine: "line-through",
                    opacity: 0.55,
                  }
                : null),
            }}
          >
            {item.text}
            {isParagraph && item.style === "inline" ? " " : ""}
          </Typography>
        </View>
      </View>
    );
  }
);

ThoughtOverviewItem.displayName = "ThoughtOverviewItem";

type ListItemProps = {
  id: string;
  title: string;
  date?: string | null;
  category?: string | null;
  overviewItems: NoteOverviewItem[];

  /** When true, render every thought instead of the truncated overview. */
  showAllContent?: boolean;

  onPress?: (id: string) => void;
};

function isInlineParagraph(item: NoteOverviewItem): boolean {
  return isTextLikeType(item.type) && item.style === "inline";
}

function getItemGap(
  current: NoteOverviewItem,
  next?: NoteOverviewItem
): number {
  if (!next) {
    return 0;
  }

  if (isInlineParagraph(current) && isInlineParagraph(next)) {
    return 0;
  }

  if (
    isTextLikeType(current.type) &&
    isTextLikeType(next.type) &&
    current.style !== "inline" &&
    next.style === "inline"
  ) {
    return 0;
  }

  // Two paragraphs get the largest spacing.
  if (isTextLikeType(current.type) && isTextLikeType(next.type)) {
    return PARAGRAPH_GAP;
  }

  // Consecutive items of the same list type form a compact group.
  if (
    current.type === next.type &&
    (current.type === "li" || current.type === "checkbox")
  ) {
    return COMPACT_GAP;
  }

  // Changing between thought types gets an intermediate gap.
  return TYPE_CHANGE_GAP;
}

export const NoteWithThoughts: React.FC<ListItemProps> = memo(
  ({ title, id, date, overviewItems, showAllContent = false, onPress }) => {
    const { push } = useRouter();
    const { colorScheme } = useColorScheme();

    const markerColor = hsl("muted-foreground", colorScheme);

    const hasMore =
      !showAllContent && overviewItems.length > MAX_VISIBLE_BULLETS;

    const visibleItems = hasMore
      ? overviewItems.slice(0, MAX_VISIBLE_BULLETS)
      : overviewItems;

    const openDetails = () => {
      if (onPress) {
        onPress(id);
        return;
      }

      pushNoteDetails(push, id);
    };

    return (
      <View
        className="bg-card w-full rounded-2xl p-3.5 pb-4"
        collapsable={false}
      >
        <Pressable
          onPress={openDetails}
          accessibilityRole="button"
          accessibilityLabel={title}
          style={StyleSheet.absoluteFillObject}
        />

        <View pointerEvents="box-none">
          <View
            className="mb-1 flex-row items-center justify-between"
            pointerEvents="none"
          >
            <DisplayDate date={date} />
          </View>

          <CardTitleRow title={title} menu={<NoteBottomSheet noteId={id} />} />

          {visibleItems.length > 0 && (
            <View className="mt-4 ml-2 flex-row flex-wrap" pointerEvents="none">
              {visibleItems.map((item, index) => {
                const nextItem = visibleItems[index + 1];
                const prevItem = visibleItems[index - 1];
                const gap = getItemGap(item, nextItem);
                const inline = isInlineParagraph(item);
                const startsInlineRun =
                  isTextLikeType(item.type) &&
                  item.style !== "inline" &&
                  Boolean(nextItem && isInlineParagraph(nextItem));
                const shareRow = inline || startsInlineRun;
                const breakBefore =
                  startsInlineRun &&
                  Boolean(prevItem && isInlineParagraph(prevItem));

                return (
                  <Fragment key={index}>
                    {breakBefore ? (
                      <View style={{ width: "100%", height: PARAGRAPH_GAP }} />
                    ) : null}
                    <View style={shareRow ? undefined : { width: "100%" }}>
                      <ThoughtOverviewItem
                        item={item}
                        markerColor={markerColor}
                      />

                      {gap > 0 && <View style={{ height: gap }} />}

                      {index === visibleItems.length - 1 && hasMore ? (
                        <View className="mt-1 ml-1 flex-row items-center gap-1">
                          <Typography
                            variant="muted"
                            padding={false}
                            style={{
                              fontSize: 13,
                              opacity: 0.75,
                            }}
                          >
                            See more
                          </Typography>

                          <Icon
                            name="arrow-right"
                            size={12}
                            color="muted-foreground"
                            style={{ marginTop: 2 }}
                          />
                        </View>
                      ) : null}
                    </View>
                  </Fragment>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.id === nextProps.id &&
    prevProps.overviewItems === nextProps.overviewItems &&
    prevProps.showAllContent === nextProps.showAllContent &&
    prevProps.onPress === nextProps.onPress
);

NoteWithThoughts.displayName = "NoteWithThoughts";
