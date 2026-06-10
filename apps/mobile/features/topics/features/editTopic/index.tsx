import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { View } from "react-native";

type EditTopicProps = {
  onPress: () => void;
};

export const EditTopic = ({ onPress }: EditTopicProps) => {
  const { dismiss } = useBottomSheetModal();

  const handlePress = () => {
    dismiss();
    onPress();
  };

  return (
    <Button variant="outline" size="default" onPress={handlePress}>
      <View className="flex-row items-center gap-2">
        <Icon name="pencil" color="foreground" size={18} />
        <Typography variant="h3">Edit topic</Typography>
      </View>
    </Button>
  );
};
