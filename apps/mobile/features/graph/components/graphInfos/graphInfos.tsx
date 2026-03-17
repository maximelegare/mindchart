import React from "react";
import { View, ScrollView } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { ThoughtsList } from "./thoughtsList";

interface Props {
  activeNode: NodeDatum | null;
  parentNode: NodeDatum | null;
}

const GraphInfos = ({ activeNode, parentNode }: Props) => {
  // If we have children, show them. If it's a leaf, show the leaf itself in the list.
  const listData = React.useMemo(() => {
    if (!activeNode) return [];
    return activeNode.children ? activeNode.children : [activeNode];
  }, [activeNode]);

  return (
    <>
      <Card className="p-4" style={{ flex: 1 }}>
        <View className="p-2 mb-4">
          <Typography variant="h3" className="font-bold">
            {activeNode?.name || "Graph Overview"}
          </Typography>
          {parentNode && (
            <Typography variant="h4" className="text-sm">
              Cluster: {parentNode.name}
            </Typography>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {listData.length > 0 ? (
            <ThoughtsList
              parentNodeId={parentNode?.id || "root"}
              thoughts={listData}
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
