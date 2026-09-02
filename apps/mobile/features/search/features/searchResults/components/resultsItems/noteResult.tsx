import React from "react";
import { Pressable, View } from "react-native";
import { Highlight } from "../highlight";
import { DisplayDate } from "@/components/ui/date";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { GroupedNoteResult } from "@/features/search/features/searchOptions/groupByNote/groupByNote";
import {
  DEFAULT_CATEGORY_COLOR,
  useCategoryColorMap,
} from "@/features/categories/hooks/useCategoryColor";
import { stripHtml } from "@/components/ui/thoughtsEditor";

export const NoteResult = ({
  query,
  data,
}: {
  query: string;
  data: GroupedNoteResult;
}) => {
  const { noteTitle, thoughts, noteId } = data;
  const categoryColorMap = useCategoryColorMap();

  const { push } = useRouter();
  const { dismiss } = useBottomSheetModal();
  const handlePress = () => {
    dismiss();
    push({
      pathname: "/notes/[id]",
      params: { id: noteId },
    });
  };

  const createdAt = new Date(thoughts[0]?.createdAt);

  return (
    <Pressable
      onPress={handlePress}
      className="px-2 py-3 flex-row gap-2 justify-between"
    >
      <View className="flex-col items-start flex-grow" style={{ width: "80%" }}>
        <Highlight
          variant="h3"
          text={noteTitle}
          query={query}
          contextWindow={20}
        />
        <View style={{ marginTop: 10, paddingLeft: 16 }}>
          {thoughts.map((thought) => (
            <View key={thought.id} className="mb-2 relative">
              <View
                className="rounded-full w-2 h-2 absolute top-2"
                style={{
                  left: -12,
                  backgroundColor:
                    categoryColorMap.get(thought.categoryId) ??
                    DEFAULT_CATEGORY_COLOR,
                }}
              ></View>
              <View>
                <Highlight
                  variant="h3"
                  className="text-base"
                  text={stripHtml(thought.title)}
                  query={query}
                />
                <Highlight text={stripHtml(thought.summary)} query={query} />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{ marginTop: 8 }}>
        <DisplayDate
          showCalendarIcon={false}
          showYear={false}
          date={createdAt}
        />
      </View>
    </Pressable>
  );
};
