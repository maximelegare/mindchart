import { Typography } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";
import { Switch } from "@/components/ui/switch";
import { View } from "react-native";

type SwitchSettingProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  accessibilityLabel?: string;
};

export const SwitchSetting = ({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
  accessibilityLabel,
}: SwitchSettingProps) => {
  return (
    <Card className="py-2">
      <Gutter size="md" className="py-3 flex-row gap-4">
        <View className="flex-1">
          <Typography variant="h3" padding>
            {title}
          </Typography>
          <Typography variant="p" padding>
            {description}
          </Typography>
        </View>
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          accessibilityLabel={accessibilityLabel}
        />
      </Gutter>
    </Card>
  );
};
