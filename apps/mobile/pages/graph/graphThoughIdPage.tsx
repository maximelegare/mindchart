import { PageContainer } from "@/components/layout/page/pageContainer";
import { GraphFeature } from "@/features/graph/views";
import { SearchFeature } from "@/features/search/views";
import { useLocalSearchParams } from "expo-router";

export const GraphThoughIdPage = () => {
  // Destructure both id and the timestamp
  const { id, _t } = useLocalSearchParams<{ id: string; _t: string }>();

  return (
    <PageContainer
      headerVariant="stack"
      title="Graph"
      buttons={<SearchFeature />}
    >
      <GraphFeature focusedThoughtId={id} trigger={_t} />
    </PageContainer>
  );
};
