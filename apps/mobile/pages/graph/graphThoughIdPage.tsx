import { PageContainer } from "@/components/layout/page/pageContainer";
import { GraphFeature } from "@/features/graph/views";
import { useLocalSearchParams } from "expo-router";

export const GraphThoughIdPage = () => {
  // Destructure both id and the timestamp
  const { id, _t } = useLocalSearchParams<{ id: string; _t: string }>();

  return (
    <PageContainer headerVariant="stack" title="Graph">
      <GraphFeature focusedThoughtId={id} trigger={_t} />
    </PageContainer>
  );
};
