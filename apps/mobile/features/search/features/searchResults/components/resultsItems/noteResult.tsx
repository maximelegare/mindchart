import { Typography } from "@/components/ui";
import React from "react";
import { Pressable, View } from "react-native";
import { Highlight } from "../highlight";

export const NoteResult = ({ query }: { query: string }) => {
  const title = "This is a title of thought";
  const summary =
    "This is the summary of the thought, which explains what the user said about the topic.";

  return (
    <Pressable className="px-4 py-3 border-b border-zinc-200 active:bg-zinc-100 flex-row gap-2 justify-between">
      <View className="flex-col" style={{ maxWidth: "80%" }}>
        {/* TITLE */}
        <Typography variant="h3" className="text-lg">
          <Highlight
            variant="h3"
            className="text-base"
            text={title}
            query={query}
          />
        </Typography>

        {/* SUMMARY */}
        <View className="mt-2">
          <Typography variant="p" className="text-zinc-400">
            <Highlight text={summary} query={query} />
          </Typography>
        </View>
      </View>

      <View>
        <Typography variant="small">May 20, 2026</Typography>
      </View>
    </Pressable>
  );
};
