import { memo } from "react";
import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import { BulletList } from "@/components/ui/bulletList";
import { CardTitleRow } from "../shared/cardTitleRow";
import { NoteBottomSheet } from "@/features/notes/noteBottomSheet";

const MAX_VISIBLE_BULLETS = 4;

type ListItemProps = {
  id: string;
  title: string;
  date?: string | null;
  category?: string | null;
  topic?: string | null;
  overviewItems: string[];
};

export const NoteWithThoughts: React.FC<ListItemProps> = memo(
  ({ title, id, date, overviewItems }) => {
    const { push } = useRouter();
    const hasMore = overviewItems.length > MAX_VISIBLE_BULLETS;
    const visibleItems = hasMore
      ? overviewItems.slice(0, MAX_VISIBLE_BULLETS)
      : overviewItems;

    return (
      <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
        <View className="flex-row items-center justify-between mb-1">
          <DisplayDate date={date} />
        </View>
        <Separator className="mb-2" color="border" />
        <CardTitleRow
          title={title}
          onTitlePress={() => push({ pathname: "/notes/[id]", params: { id } })}
          menu={<NoteBottomSheet noteId={id} />}
        />
        {visibleItems.length > 0 && (
          <View className="gap-3 mt-2">
            <Separator />
            <BulletList
              bulletClassName="mt-[10px]"
              bulletColor="border"
              items={visibleItems.map((summary, idx) => (
                <>
                  <View key={idx}>
                    <Typography variant="p">{summary}</Typography>
                  </View>
                  {idx === visibleItems.length - 1 && hasMore && (
                    <Typography variant="muted" className="ml-4 -mt-2">
                      ...
                    </Typography>
                  )}
                </>
              ))}
            />
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.id === nextProps.id &&
    prevProps.overviewItems === nextProps.overviewItems
);
