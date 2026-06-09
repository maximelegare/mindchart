import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import { TopicItem } from "../components/topicItem";
import { SpaceFiller } from "@/components/ui/spaceFiller";

export const TopicsListFeature = () => {
  const { useFetchAllTopicsWithNotesInfosQuery } = useControllers().topics;

  const { data } = useFetchAllTopicsWithNotesInfosQuery();

  return (
    <List className="gap-2 border-[0px]">
      {data?.map((topic) => (
        <TopicItem key={topic.id} {...topic} />
      ))}
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </List>
  );
};
