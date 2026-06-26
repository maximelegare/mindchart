import { View } from "react-native";

type PageOptionsHeaderContainerProps = {
  children: React.ReactNode;
};

export const PageOptionsHeaderContainer = ({
  children,
}: PageOptionsHeaderContainerProps) => {
  return (
    <View className="border-b border-border  bg-card w-full rounded-t-3xl">
      {children}
    </View>
  );
};
