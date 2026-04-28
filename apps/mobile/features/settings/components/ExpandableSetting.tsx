import { ReactElement, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui";
import { Separator } from "@/components/ui/separator";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import { Theme } from "@repo/theme/global";

type ExpandableSettingProps = {
  id: string;
  children: ReactElement | ReactNode;
  title: string;
  label?: { text: string; color: Theme } | null;
  date?: string | null;
  category?: string | null;
  onPress?: (id: string) => void;
  expanded: boolean;
};

export const ExpandableSetting: React.FC<ExpandableSettingProps> = ({
  children,
  title,
  id,
  onPress,
  expanded,
  label,
}) => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <View className="bg-card border-border border w-full rounded-lg p-2 pb-4">
        <Pressable onPress={() => onPress && onPress(id)}>
          <View>
            <Separator className="mb-2" color="border" />
            <View className="flex-row gap-2 justify-between items-start">
              <View className="flex-1">
                <Typography variant="h3">{title.toUpperCase()}</Typography>
              </View>
              {label && (
                <View className="">
                  <Typography
                    variant="p"
                    style={{
                      fontSize: 12,
                      marginTop: 2,
                      color: hsl(label.color, "theme", colorScheme),
                    }}
                  >
                    {label.text}
                  </Typography>
                </View>
              )}
              <View className="relative" style={{ width: 40 }}>
                <Button
                  className="absolute right-0"
                  style={{ top: -10 }}
                  variant="ghost"
                  size="icon"
                  onPress={() => onPress && onPress(id)}
                >
                  <Icon
                    name={expanded ? "chevron-up" : "chevron-down"}
                    color="text"
                    size={20}
                  />
                </Button>
              </View>
            </View>
          </View>
        </Pressable>

        <CollapsibleContainer expanded={expanded}>
          {children}
        </CollapsibleContainer>
      </View>
    </>
  );
};
