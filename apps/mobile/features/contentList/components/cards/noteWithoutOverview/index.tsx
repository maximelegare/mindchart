import { memo } from "react";
import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import { Note } from "@repo/zod-schemas";
import { CardTitleRow } from "../shared/cardTitleRow";
import { NoteBottomSheet } from "@/features/notes/noteBottomSheet";

export const NoteWithoutOverview: React.FC<Note> = memo(
  ({ title, id, createdAt }) => {
    const { push } = useRouter();

    return (
      <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
        <View className="flex-row items-center justify-between mb-1">
          <DisplayDate date={createdAt} />
        </View>
        <Separator className="mb-2" color="border" />
        <CardTitleRow
          title={title}
          onTitlePress={() => push({ pathname: "/notes/[id]", params: { id } })}
          menu={<NoteBottomSheet noteId={id} />}
        />
      </View>
    );
  }
);
