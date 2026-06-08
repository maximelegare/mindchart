import { useControllers } from "@/api/controllers/useControllers";
import List from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";

export const TopicsListFeature = () => {
  const { useFetchAllTopicsQuery } = useControllers().topics;

  const { data } = useFetchAllTopicsQuery();

  return (
    <List>
      {data?.map((topic) => (
        <ListItem key={topic.id} label={topic.name} />
      ))}
    </List>
  );
};
