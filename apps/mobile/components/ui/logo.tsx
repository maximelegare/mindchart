import { Image, View } from "react-native";
import { Typography } from "./typography";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

export const LogoWithText = () => {
  const { colorScheme } = useColorScheme();

  const logoWidth = 24;
  const logoHeight = 24;
  const textPosition = `left-[26px]`;
  return (
    <View className="flex-row items-end gap-1 relative ml-1">
      <Image
        source={require("@/assets/images/icon.png")}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
      />
      <View
        className={`flex-row items-center absolute bottom-[-5px] ${textPosition}`}
      >
        <Typography
          variant="h4"
          className="text-3xl"
          style={{ color: hsl("background", "theme", colorScheme) }}
        >
          mind
        </Typography>
        <Typography
          variant="h4"
          className="text-3xl"
          style={{ color: hsl("border", "theme", colorScheme, 20) }}
        >
          chart
        </Typography>
      </View>
    </View>
  );
};
