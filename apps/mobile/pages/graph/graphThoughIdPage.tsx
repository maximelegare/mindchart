import { PageContainer } from "@/components/layout/page/pageContainer";
import { GraphFeature } from "@/features/graph/views";
import { parseGraphMode } from "@/features/graph/types/types";
import { SearchFeature } from "@/features/search/views";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";

export const GraphThoughIdPage = () => {
  const { id, _t, graph } = useLocalSearchParams<{
    id: string;
    _t?: string;
    graph?: string;
  }>();
  const router = useRouter();
  const mode = parseGraphMode(graph);

  const [open, setOpen] = useState(false);

  const handleModeChange = useCallback(
    (nextMode: "category" | "topic") => {
      router.setParams({ graph: nextMode });
    },
    [router]
  );

  return (
    <PageContainer
      headerVariant="stack"
      showLogo={true}
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <GraphFeature
        mode={mode}
        onModeChange={handleModeChange}
        focusedThoughtId={id}
        trigger={_t}
      />
    </PageContainer>
  );
};
