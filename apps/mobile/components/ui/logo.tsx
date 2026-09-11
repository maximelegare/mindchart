import { Image, View } from "react-native";
import { Typography } from "./typography";
import { hsl } from "@/utils/hsl";

/** Lighter green used for the "chart" half of the wordmark. */
export const LOGO_CHART_COLOR = hsl("border", "theme", "light", 20);

export const LogoWithText = () => {
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
          style={{
            // Logo sits on the green gradient chrome (always light-on-green).
            color: hsl("background", "theme", "light"),
            fontFamily: "QuicksandRegular",
          }}
        >
          mind
        </Typography>
        <Typography
          variant="h4"
          className="text-3xl"
          style={{
            color: LOGO_CHART_COLOR,
            fontFamily: "QuicksandRegular",
          }}
        >
          chart
        </Typography>
      </View>
    </View>
  );
};
