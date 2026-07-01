import React from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { ThoughtsList } from "./thoughtsList";
interface Props {
  activeNode: NodeDatum | null;
  focusedThoughtId?: string;
}

const GraphInfos = ({ activeNode, focusedThoughtId }: Props) => {
  const listData = React.useMemo(() => {
    if (!activeNode) return [];
    return activeNode.children ? activeNode.children : [activeNode];
  }, [activeNode]);

  return (
    <>
      <View className="p-4" style={{ flex: 1 }}>
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
      </View>
    </>
  );
};

export default GraphInfos;
