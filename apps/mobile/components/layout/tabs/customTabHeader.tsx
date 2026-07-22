import { View } from "react-native";
import { Button } from "@/components/ui";
import { Gutter } from "@/components/ui/gutter";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";
import { HeaderContent } from "@/components/layout/shared/headerContent";
import type { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Typography } from "@/components/ui/typography";

type CustomTabBarProps = {
  route: BottomTabHeaderProps["route"];
  options: BottomTabHeaderProps["options"];
};

export const CustomTabHeader = ({ options }: CustomTabBarProps) => {
  const { push } = useRouter();

  return (
    <View className="-z-10 absolute w-full rounded-b-[10px] overflow-hidden">
      <Gutter size="sm">
        <View className="w-full flex-row justify-between">
          <HeaderContent
            title={options.title || "Page"}
            hideBackButton
            buttons={[
              <Button
                key="graph"
                variant="secondary"
                onPress={() => push("/graph")}
                cornerRadius="full"
              >
                <Icon color="background" name="graph" />
              </Button>,
              <Button
                key="categories"
                variant="secondary"
                onPress={() => push("/categories")}
                cornerRadius="full"
              >
                <Typography>C</Typography>
              </Button>,
            ]}
          />
        </View>
      </Gutter>
    </View>
  );
};
