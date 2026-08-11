import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useNoteCreationStore } from "@/features/notes/noteCreation/context/noteCreationContext";

export const AiModelRequired = ({ message }: { message: string }) => {
  const router = useRouter();
  const requestFabClose = useNoteCreationStore(
    (state) => state.requestFabClose
  );

  const handleOpenSettings = () => {
    requestFabClose();
    router.push("/settings");
  };

  return (
    <View className="min-h-0 flex-1 items-center justify-center gap-4 px-6">
      <Typography className="text-center text-popover-foreground">
        {message}
      </Typography>
      <Button variant="outline" size="sm" onPress={handleOpenSettings}>
        <Typography className="font-semibold text-popover-foreground">
          Go to Settings
        </Typography>
      </Button>
    </View>
  );
};
