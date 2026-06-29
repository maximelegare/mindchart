import { PageContainer } from "@/components/layout/page/pageContainer";
import { GraphModeToggle } from "@/features/graph/components/graphModeToggle";
import { useGraphStore } from "@/features/graph/context/graphContext";
import { GraphFeature } from "@/features/graph/views";
import { parseGraphMode } from "@/features/graph/types/types";
import { SearchFeature } from "@/features/search/views";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export const GraphThoughIdPage = () => {
  const { id, _t, graph } = useLocalSearchParams<{
    id: string;
    _t?: string;
    graph?: string;
  }>();
  const setGraphMode = useGraphStore((state) => state.setGraphMode);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (graph !== undefined) {
      setGraphMode(parseGraphMode(graph));
    }
  }, [graph, setGraphMode]);

  return (
    <PageContainer
      headerVariant="stack"
      showLogo={true}
      buttons={<SearchFeature />}
      optionsHeader={<GraphModeToggle />}
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <GraphFeature focusedThoughtId={id} trigger={_t} />
    </PageContainer>
  );
};
