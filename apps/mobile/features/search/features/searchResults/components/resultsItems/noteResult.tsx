import { Typography } from "@/components/ui";
import React from "react";
import { Pressable, View } from "react-native";
import { Highlight } from "../highlight";

export const NoteResult = ({ query }: { query: string }) => {
  const noteTitle = "Refining the User Onboarding Flow for Mobile App";
  const thoughtTitle = "Simplify Social Login Integration";
  const thoughtSummary =
    "Implement OAuth for Google and Apple to allow one-tap registration and reduce drop-off rates.";

  return (
    <Pressable className="px-2 py-3 border-b border-input flex-row gap-2 items-center justify-between">
      <View className="flex-col" style={{ maxWidth: "75%" }}>
        <Highlight
          variant="h3"
          className=""
          text={noteTitle}
          query={query}
          contextWindow={15}
        />
        <View className="ml-2">
          <Highlight
            variant="h3"
            className="text-base"
            text={thoughtTitle}
            query={query}
            contextWindow={15}
          />

          <View className="mt-2">
            <Highlight text={thoughtSummary} query={query} />
          </View>
        </View>
      </View>

      <View>
        <Typography variant="small">May 20</Typography>
      </View>
    </Pressable>
  );
};

// {
//     "title": "Refining the User Onboarding Flow for Mobile App",
//     "summary": "A discussion on reducing friction during the initial sign-up process and implementing a progress bar for user engagement.",
//     "topicId": "topic_001",
//     "thoughts": [
//       {
//         "title": "Simplify Social Login Integration",
//         "summary": "Implement OAuth for Google and Apple to allow one-tap registration and reduce drop-off rates.",
//         "category": "tasks",
//         "semanticLabel": "Authentication optimization"
//       },
//       {
//         "title": "Gamified Progress Tracking",
//         "summary": "Using a visual progress bar during setup makes the user feel a sense of achievement immediately.",
//         "category": "ideas",
//         "semanticLabel": "Engagement strategy"
//       }
//     ]
//   },
//   {
//     "title": "Quarterly Financial Review and Budget Planning for Q3",
//     "summary": "Analysis of current spending patterns and reallocating resources toward the marketing department for the upcoming product launch.",
//     "topicId": "topic_002",
//     "thoughts": [
//       {
//         "title": "Overspending in Cloud Infrastructure",
//         "summary": "The AWS bill has increased by 15% due to inefficient database queries that need optimization.",
//         "category": "problems",
//         "semanticLabel": "Budgetary leak"
//       },
//       {
//         "title": "Hiring Three New Growth Marketers",
//         "summary": "Allocate funds to bring in specialists for SEO and paid social media acquisition.",
//         "category": "plans",
//         "semanticLabel": "Team expansion"
//       }
//     ]
//   },
