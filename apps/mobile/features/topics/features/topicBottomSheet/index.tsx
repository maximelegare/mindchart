import React from "react";
import { TouchableOpacity } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import { DeleteTopic } from "../deleteTopic";
import { EditTopic } from "../editTopic";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";

type TopicBottomSheetProps = {
  topic: TopicWithNotesInfos;
  onEditPress: () => void;
};

export const TopicBottomSheet = ({
  topic,
  onEditPress,
}: TopicBottomSheetProps) => {
  const { isReady } = useLlamaEmbeddings();

  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <TouchableOpacity className="rounded-full flex-row items-center gap-2 w-fit">
            <Icon name="ellipsis-vertical" color="text" size={20} />
          </TouchableOpacity>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          style={{ zIndex: 100 }}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-3 pt-6 bg-background">
            <EditTopic onPress={onEditPress} disabled={!isReady} />
            <DeleteTopic topicId={topic.id} />
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};
