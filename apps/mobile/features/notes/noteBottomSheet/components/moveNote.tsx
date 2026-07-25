import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { View } from "react-native";

type MoveNoteProps = {
  onPress: () => void;
};

export const MoveNote = ({ onPress }: MoveNoteProps) => {
  const { dismiss } = useBottomSheetModal();

  const handlePress = () => {
    dismiss();
    onPress();
  };

  return (
    <Button variant="outline" size="default" onPress={handlePress}>
      <View className="flex-row items-center gap-2">
        <Icon name="arrow-right-left" color="foreground" size={18} />
        <Typography variant="h3">Move note</Typography>
      </View>
    </Button>
  );
};
