import { TopicsListFeature } from "@/features/topics/features/topicsList/views/index";
import { useSelectedFolderId } from "@/features/contentList/hooks/useContentListFilter";
import { useContentListSort } from "@/features/contentList/hooks/useContentListSort";

export const TopicsOnlyViewFeature = () => {
  const sortBy = useContentListSort();
  const selectedFolderId = useSelectedFolderId();

  return (
    <TopicsListFeature
      withSpaceFiller={false}
      sortBy={sortBy}
      selectedFolderId={selectedFolderId}
    />
  );
};
