import { useControllers } from "@/api/controllers/useControllers";
import { useModal } from "@/components/ui/modal/modal";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";
import { useCallback } from "react";
import { EditTopicModalContent } from "../components/editTopicModalContent";

export const useEditTopic = (topic: TopicWithNotesInfos) => {
  const { openModal, closeModal } = useModal();
  const { embed } = useLlamaEmbeddings();
  const { useUpdateTopicByIdMutation } = useControllers().topics;
  const { mutateAsync: updateTopicByIdMutateAsync } =
    useUpdateTopicByIdMutation();

  const handleSave = useCallback(
    async (name: string) => {
      const embedding = await embed(name, "clustering");
      await updateTopicByIdMutateAsync({
        id: topic.id,
        name,
        embedding,
      });
      closeModal();
    },
    [closeModal, embed, topic.id, updateTopicByIdMutateAsync]
  );

  const openEditTopicModal = useCallback(() => {
    openModal({
      customContent: () => (
        <EditTopicModalContent topic={topic} onSave={handleSave} />
      ),
    });
  }, [handleSave, openModal, topic]);

  return { openEditTopicModal };
};
