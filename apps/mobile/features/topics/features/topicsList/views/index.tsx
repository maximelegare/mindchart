import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { TopicItem } from "../components/topicItem";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { useMemo } from "react";
import {
  SortBy,
  sortContentList,
} from "@/features/contentList/utils/sortContentList";
import { normalizeNotesFromQuery } from "@/features/contentList/utils/normalizeNotesFromQuery";

export const TopicsListFeature = ({
  withSpaceFiller = true,
  sortBy,
  selectedFolderId,
}: {
  withSpaceFiller?: boolean;
  sortBy?: SortBy;
  selectedFolderId?: string | null;
}) => {
  const { useFetchAllTopicsWithNotesInfosQuery } = useControllers().topics;
  const { useFetchAllNotesQuery } = useControllers().notesAndThoughts;

  const { data } = useFetchAllTopicsWithNotesInfosQuery();
  const { data: notesData } = useFetchAllNotesQuery({
    enabled: !!selectedFolderId,
  });

  const sortedData = useMemo(() => {
    if (!data) return undefined;

    let filtered = data;
    if (selectedFolderId) {
      const notes = normalizeNotesFromQuery(notesData);
      const topicIds = new Set(
        (notes ?? [])
          .filter((note) => note.folderId === selectedFolderId)
          .map((note) => note.topicId)
          .filter((id): id is string => !!id)
      );
      filtered = data.filter((topic) => topicIds.has(topic.id));
    }

    if (!sortBy) return filtered;

    return sortContentList(filtered, sortBy, {
      getName: (topic) => topic.name,
      getDate: (topic) => topic.createdAt,
    });
  }, [data, notesData, selectedFolderId, sortBy]);

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
