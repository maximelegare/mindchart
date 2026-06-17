import { Typography } from "@/components/ui/typography";
import { ReactNode } from "react";
import { View } from "react-native";

type TopicSectionProps = {
  name: string;
  children: ReactNode;
};

export const TopicSection = ({ name, children }: TopicSectionProps) => (
  <View className="gap-2">
    <Typography
      variant="muted"
      className="rounded-full bg-border px-2"
      style={{ alignSelf: "flex-start", flexGrow: 0 }}
    >
      {name.toUpperCase()}
    </Typography>
    {children}
  </View>
);
