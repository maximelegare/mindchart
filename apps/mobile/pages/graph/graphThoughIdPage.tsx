import { PageContainer } from "@/components/layout/page/pageContainer";
import { GraphModeToggle } from "@/features/graph/components/graphModeToggle";
import { setGraphModeImmediate } from "@/features/graph/context/graphContext";
import { GraphFeature } from "@/features/graph/views";
import { parseGraphMode } from "@/features/graph/types/types";
import { useOptionsBar } from "@/features/contentList/components/optionsBar/context/optionBarContext";
import { areBreadcrumbsLinked } from "@/features/navigation/breadcrumbLinkStore";
import { graphIdFromFolderId } from "@/features/navigation/syncLinkedBreadcrumbs";
import { SearchFeature } from "@/features/search/views";
import { settingsPageTitleString } from "@/features/settings/settingsLabels";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const GraphThoughIdPage = () => {
  const { id, _t, graph } = useLocalSearchParams<{
    id: string;
    _t?: string;
    graph?: string;
  }>();
  const { setParams } = useRouter();
  const idRef = useRef(id);
  idRef.current = id;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (graph !== undefined) {
      setGraphModeImmediate(parseGraphMode(graph));
    }
  }, [graph]);

  // When breadcrumbs are linked, apply the notes folder once on tab focus.
  // Do not depend on `id` — otherwise card/home navigations get snapped back.
  useFocusEffect(
    useCallback(() => {
      if (!areBreadcrumbsLinked()) return;
      const folderId = useOptionsBar.getState().currentFolderId;
      const desiredId = graphIdFromFolderId(folderId);
      const currentId =
        typeof idRef.current === "string" ? idRef.current : idRef.current?.[0];
      if (currentId === desiredId) return;
      setParams({
        id: desiredId,
        _t: Date.now().toString(),
      });
    }, [setParams])
  );

  return (
    <PageContainer
      headerVariant="stack"
      showLogo={true}
      buttons={[<SearchFeature />]}
      optionsHeader={<GraphModeToggle />}
      moreOptionsMenu={{
        links: [
          {
            label: settingsPageTitleString(),
            icon: "settings",
            href: "/settings",
          },
        ],
        state: { open, setOpen },
      }}
    >
      <GraphFeature focusedThoughtId={id} trigger={_t} />
    </PageContainer>
  );
};
