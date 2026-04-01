import React from "react";
import { View } from "react-native";
import { ThoughtItem } from "./thoughtItem";
import { NodeDatum } from "../../types/types";
import { generateID } from "@/utils/genrateID";

type ThoughtsList = {
  thoughts: NodeDatum[];
  parentNodeId: string;
};

export const ThoughtsList: React.FC<ThoughtsList> = ({
  thoughts,
  parentNodeId,
}) => {
  return (
    <View className="flex-col gap-3 p-2">
      {thoughts.map((t) => (
        <ThoughtItem
          key={generateID()}
          parentNodeId={parentNodeId}
          thought={{ ...t, idx: 0 }} // Assuming idx is used for something specific, otherwise 0
        />
      ))}
    </View>
  );
};
