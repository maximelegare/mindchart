import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View>
        <Typography>This screen doesn't exist.</Typography>

        <Link href="/notes">
          <Typography>Go to notes!</Typography>
        </Link>
      </View>
    </>
  );
}
