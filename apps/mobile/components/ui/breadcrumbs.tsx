import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  id: string;
  name: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
  className?: string;
  /** When provided, fully replaces the default crumb for each item. */
  renderItem?: (args: {
    item: BreadcrumbItem;
    index: number;
    isLast: boolean;
  }) => React.ReactNode;
};

export const Breadcrumbs = ({
  items,
  onNavigate,
  renderItem,
  className,
}: BreadcrumbsProps) => {
  const handleGoBack = () => {
    if (items.length > 1) {
      onNavigate(items[items.length - 2].id);
    }
  };

  return (
    <View className={cn("flex-1 flex-row items-center", className)}>
      <TouchableOpacity
        disabled={items.length <= 1}
        onPress={handleGoBack}
        className={cn(
          "h-10 w-8 shrink-0 bg-input rounded-sm items-center justify-center",
          items.length <= 1 ? "opacity-50" : ""
        )}
      >
        <Icon
          name="chevron-left"
          color="text"
          opacity={items.length <= 1 ? 50 : 100}
        />
      </TouchableOpacity>

      <ScrollView
        horizontal
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 8,
          gap: 0,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (renderItem) {
            return (
              <React.Fragment key={item.id}>
                {renderItem({ item, index, isLast })}
              </React.Fragment>
            );
          }

          return (
            <View key={item.id} className="flex-row items-center shrink-0">
              <Button
                variant="ghost"
                size="xs"
                className={cn(
                  "opacity-50 shrink-0 px-0",
                  isLast ? "opacity-100" : ""
                )}
                onPress={() => onNavigate(item.id)}
              >
                {item.id === "root" || item.name.toLowerCase() === "root" ? (
                  <Icon name="house" color="text" size={18} />
                ) : (
                  <Typography variant="h3" numberOfLines={1}>
                    {item.name}
                  </Typography>
                )}
              </Button>
              {!isLast && (
                <Typography
                  variant="p"
                  className="opacity-50"
                  style={{ marginHorizontal: 2 }}
                >
                  /
                </Typography>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
