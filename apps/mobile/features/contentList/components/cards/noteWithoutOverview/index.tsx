import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import { Note } from "@repo/zod-schemas";
import { CardTitleRow, pushNoteDetails } from "../shared/cardTitleRow";
import { NoteBottomSheet } from "@/features/notes/noteBottomSheet";

export const NoteWithoutOverview: React.FC<Note> = memo(
  ({ title, id, createdAt }) => {
    const { push } = useRouter();

    return (
      <View
        className="bg-card w-full rounded-2xl p-3.5 pb-4"
        collapsable={false}
      >
        <Pressable
          onPress={() => pushNoteDetails(push, id)}
          accessibilityRole="button"
          accessibilityLabel={title}
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="box-none">
          <View
            className="flex-row items-center justify-between mb-1"
            pointerEvents="none"
          >
            <DisplayDate date={createdAt} />
          </View>
          <Separator className="mb-2" color="border" pointerEvents="none" />
          <CardTitleRow title={title} menu={<NoteBottomSheet noteId={id} />} />
        </View>
      </View>
    );
  }
);
