import { Thought } from "@repo/zod-schemas";
import React from "react";
import { View } from "react-native";
import { ThoughtItem } from "./ThoughtItem";

type ThoughtsList = {
  thoughts: Thought[];
};

const ThoughtsList: React.FC<ThoughtsList> = ({ thoughts }) => {
  return (
    <View className="flex-col gap-3">
      {thoughts.map((t, idx) => (
        <ThoughtItem key={idx} thoughts={{ idx, ...t }} />
      ))}
    </View>
  );
};

export default ThoughtsList;
