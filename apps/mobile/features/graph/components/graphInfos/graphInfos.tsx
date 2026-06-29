import React from "react";
import { ScrollView } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { ThoughtsList } from "./thoughtsList";
import { GraphBreadcrumbs } from "./graphBreadcrumbs";

interface Props {
  hierarchy: NodeDatum;
  activeNode: NodeDatum | null;
  focusedThoughtId?: string;
}

const GraphInfos = ({ hierarchy, activeNode, focusedThoughtId }: Props) => {
  const listData = React.useMemo(() => {
    if (!activeNode) return [];
    return activeNode.children ? activeNode.children : [activeNode];
  }, [activeNode]);

  return (
    <>
      <Card className="p-4" style={{ flex: 1 }}>
        <GraphBreadcrumbs hierarchy={hierarchy} activeNode={activeNode} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {listData.length > 0 ? (
            <ThoughtsList
              parentNodeId={activeNode?.id ?? "root"}
              thoughts={listData}
              focusedThoughtId={focusedThoughtId}
            />
          ) : (
            <Typography className="text-center py-10 opacity-50">
              Select a node to see details
            </Typography>
          )}
        </ScrollView>
      </Card>
    </>
  );
};

export default GraphInfos;
