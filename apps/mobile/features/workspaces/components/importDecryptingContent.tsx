import { ActivityIndicator, View } from "react-native";
import { Typography } from "@/components/ui/typography";

export const ImportDecryptingContent = () => (
  <View className="flex-col gap-4 items-center py-6">
    <ActivityIndicator size="large" />
    <Typography variant="muted">Decrypting archive…</Typography>
  </View>
);
