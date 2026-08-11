import { Typography } from "@/components/ui";
import { Gutter } from "@/components/ui/gutter";
import { View } from "react-native";

type SwitchSettingProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export const CustomSettingComponent = ({
  title,
  description,
  children,
}: SwitchSettingProps) => {
  return (
    <View>
      <Gutter size="md" className="py-3 gap-4">
        <View className="flex-1">
          <Typography variant="h3" padding>
            {title}
          </Typography>
          <Typography variant="p" padding>
            {description}
          </Typography>
        </View>
        <View className="flex-1">{children}</View>
      </Gutter>
    </View>
  );
};
