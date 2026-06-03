import { View } from "react-native";
import { Typography } from "@/components/ui/typography";

export const ModalTitle = ({ title }: { title: string }) => {
  return (
    <View className="relative">
      <View className="mb-2">
        <Typography className="relative z-10" variant="h3">
          {title}
        </Typography>
      </View>
      <View className="absolute -top-3 -right-3 -left-3 bg-border h-12"></View>
    </View>
  );
};
