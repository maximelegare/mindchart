import { TopicsListFeature } from "@/features/topics/features/topicsList/views/index";
import { useSelectedTopicId } from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";

export const TopicsOnlyViewFeature = () => {
  const sortBy = useContentListSort();
  const selectedTopicId = useSelectedTopicId();

  return (
    <TopicsListFeature
      withSpaceFiller={false}
      sortBy={sortBy}
      selectedTopicId={selectedTopicId}
    />
  );
};
