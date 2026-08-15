import { View } from "react-native";
import { Typography } from "@/components/ui/typography";

export const ModalTitle = ({ title }: { title: string }) => {
  return (
    <View className="-mx-3 -mt-3 mb-1 bg-border px-3 pt-3 pb-2.5">
      <Typography variant="h3" className="shrink">
        {title}
      </Typography>
    </View>
  );
};
