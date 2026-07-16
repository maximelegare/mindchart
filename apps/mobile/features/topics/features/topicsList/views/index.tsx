import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { TopicItem } from "../components/topicItem";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useMemo } from "react";
import {
  SortBy,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";

export const TopicsListFeature = ({
  withSpaceFiller = true,
  sortBy,
  selectedTopicId,
}: {
  withSpaceFiller?: boolean;
  sortBy?: SortBy;
  selectedTopicId?: string | null;
}) => {
  const { useFetchAllTopicsWithNotesInfosQuery } = useControllers().topics;

  const { data } = useFetchAllTopicsWithNotesInfosQuery();

  const sortedData = useMemo(() => {
    if (!data) return undefined;

    const filtered = selectedTopicId
      ? data.filter((topic) => topic.id === selectedTopicId)
      : data;

    if (!sortBy) return filtered;

    return sortContentList(filtered, sortBy, {
      getName: (topic) => topic.name,
      getDate: (topic) => topic.createdAt,
    });
  }, [data, selectedTopicId, sortBy]);

  return (
    <List className="gap-2 border-[0px]" style={{ paddingTop: 20 }}>
      {sortedData?.map((topic) => (
        <TopicItem key={topic.id} {...topic} />
      ))}
      {withSpaceFiller ? (
        <SpaceFiller
          sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
        />
      ) : null}
    </List>
  );
};
