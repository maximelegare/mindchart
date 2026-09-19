import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import { CardTitleRow, pushNoteDetails } from "../shared/cardTitleRow";
import { NoteBottomSheet } from "@/features/notes/noteBottomSheet";
import {
  CHECKBOX_MARK_SIZE,
  StaticCheckboxMark,
} from "../shared/staticCheckboxMark";
import { stripHtml } from "@/components/ui/thoughtsEditor";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

const MAX_VISIBLE_BULLETS = 4;
const BULLET_SIZE = 6;
const TEXT_LINE_HEIGHT = 22;

export type NoteOverviewItem = {
  text: string;
  isChecklist?: boolean;
  isCompleted?: boolean;
  markerColor?: string;
};

export function thoughtToOverviewItem(thought: {
  summary?: string | null;
  title?: string | null;
  isCompletable?: boolean;
  isCompleted?: boolean;
}): NoteOverviewItem {
  return {
    text: stripHtml(thought.summary || thought.title || ""),
    isChecklist: Boolean(thought.isCompletable),
    isCompleted: Boolean(thought.isCompleted),
  };
}

type ListItemProps = {
  id: string;
  title: string;
  date?: string | null;
  category?: string | null;
  overviewItems: NoteOverviewItem[];
  /** When true, render every thought instead of the truncated overview. */
  showAllContent?: boolean;
};

export const NoteWithThoughts: React.FC<ListItemProps> = memo(
  ({ title, id, date, overviewItems, showAllContent = false }) => {
    const { push } = useRouter();
    const { colorScheme } = useColorScheme();
    const markerColor = hsl("muted-foreground", colorScheme);
    const hasMore =
      !showAllContent && overviewItems.length > MAX_VISIBLE_BULLETS;
    const visibleItems = hasMore
      ? overviewItems.slice(0, MAX_VISIBLE_BULLETS)
      : overviewItems;

    const openDetails = () => pushNoteDetails(push, id);

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
            className="flex-row items-center justify-between mb-1"
            pointerEvents="none"
          >
            <DisplayDate date={date} />
          </View>
          <CardTitleRow title={title} menu={<NoteBottomSheet noteId={id} />} />
          {visibleItems.length > 0 && (
            <View className="mt-4 ml-2" pointerEvents="none">
              {visibleItems.map((item, idx) => {
                const completed = Boolean(item.isChecklist && item.isCompleted);
                return (
                  <View
                    key={idx}
                    className="flex-row items-start"
                    style={{ marginBottom: 10 }}
                  >
                    <View
                      style={{
                        width: CHECKBOX_MARK_SIZE,
                        height: TEXT_LINE_HEIGHT,
                        marginRight: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.isChecklist ? (
                        <StaticCheckboxMark
                          completed={completed}
                          color={item.markerColor ?? markerColor}
                        />
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
                    <View className="flex-1">
                      <Typography
                        variant="p"
                        padding={false}
                        style={{
                          lineHeight: TEXT_LINE_HEIGHT,
                          includeFontPadding: false,
                          ...(completed
                            ? {
                                textDecorationLine: "line-through" as const,
                                opacity: 0.55,
                              }
                            : null),
                        }}
                      >
                        {item.text}
                      </Typography>
                      {idx === visibleItems.length - 1 && hasMore ? (
                        <Typography variant="muted" padding={false}>
                          ...
                        </Typography>
                      ) : null}
                    </View>
                  </View>
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
    prevProps.showAllContent === nextProps.showAllContent
);
