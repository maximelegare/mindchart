import React from "react";
import { View } from "react-native";
import { ThoughtItem } from "./thoughtItem";
import { GraphMode, NodeDatum } from "../../types/types";

type ThoughtsListProps = {
  thoughts: NodeDatum[];
  parentNodeId: string;
  focusedThoughtId?: string;
  graphMode: GraphMode;
};

export const ThoughtsList: React.FC<ThoughtsListProps> = ({
  thoughts,
  parentNodeId,
  focusedThoughtId,
  graphMode,
}) => {
  const highlightedThought = thoughts.find(
    (t) => t.thoughtId === focusedThoughtId
  );
  const sortedThoughts = [
    ...(highlightedThought ? [highlightedThought] : []),
    ...thoughts.filter((t) => t.thoughtId !== focusedThoughtId),
  ];

  return (
    <View className="flex-col gap-3 p-2">
      {sortedThoughts.map((t, idx) => (
        <ThoughtItem
          key={t.thoughtId ?? t.id}
          parentNodeId={parentNodeId}
          thought={{ ...t, idx }}
          isHighlighted={focusedThoughtId === t.thoughtId}
          graphMode={graphMode}
        />
      ))}
    </View>
  );
};
