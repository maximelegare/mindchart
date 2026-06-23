import { PageContainer } from "@/components/layout/page/pageContainer";
import { GraphFeature } from "@/features/graph/views";
import { SearchFeature } from "@/features/search/views";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export const GraphThoughIdPage = () => {
  // Destructure both id and the timestamp
  const { id, _t } = useLocalSearchParams<{ id: string; _t: string }>();

  const [open, setOpen] = useState(false);
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
      <GraphFeature focusedThoughtId={id} trigger={_t} />
    </PageContainer>
  );
};
