import { View } from "react-native";
import { LAYOUT_SIZES } from "../constants";

type PageOptionsHeaderContainerProps = {
  children: React.ReactNode;
};

export const PageOptionsHeaderContainer = ({
  children,
}: PageOptionsHeaderContainerProps) => {
  return (
    <View
      className="border-b border-border  bg-card w-full rounded-t-3xl justify-center"
      style={{ height: LAYOUT_SIZES.OPTIONS_HEADER_HEIGHT }}
    >
      <View>{children}</View>
    </View>
  );
};
