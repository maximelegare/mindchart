import { TopicsListFeature } from "@/features/topics/features/topicsList/views/index";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";

export const TopicsOnlyViewFeature = () => {
  const sortBy = useContentListSort();

  return <TopicsListFeature withSpaceFiller={false} sortBy={sortBy} />;
};
