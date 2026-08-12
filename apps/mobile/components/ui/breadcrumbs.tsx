import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Typography } from "@/components/ui/typography";
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
  /** When true, crumbs and back control are non-interactive with a muted look. */
  disabled?: boolean;
  /** When provided, fully replaces the default crumb for each item. */
  renderItem?: (args: {
    item: BreadcrumbItem;
    index: number;
    isLast: boolean;
  }) => React.ReactNode;
};

const isRootItem = (item: BreadcrumbItem) =>
  item.id === "root" ||
  item.id === "Root" ||
  item.name.toLowerCase() === "root";

/** Default crumb — matches notes `FolderBreadcrumbCrumb` visuals. */
export function BreadcrumbCrumb({
  item,
  isLast,
  onNavigate,
  disabled = false,
}: {
  item: BreadcrumbItem;
  isLast: boolean;
  onNavigate: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center shrink-0" collapsable={false}>
      <Pressable
        disabled={disabled}
        onPress={() => onNavigate(item.id)}
        hitSlop={8}
      >
        <View
          className={cn(
            "h-10 justify-center opacity-50 px-1",
            !disabled && isLast ? "opacity-100" : ""
          )}
        >
          {isRootItem(item) ? (
            <Icon name="house" color="text" size={18} />
          ) : (
            <Typography variant="h5" numberOfLines={1}>
              {item.name}
            </Typography>
          )}
        </View>
      </Pressable>
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
}

export const Breadcrumbs = ({
  items,
  onNavigate,
  renderItem,
  className,
  disabled = false,
}: BreadcrumbsProps) => {
  const backDisabled = disabled || items.length <= 1;

  const handleGoBack = () => {
    if (disabled || items.length <= 1) return;
    onNavigate(items[items.length - 2].id);
  };

  return (
    <View
      className={cn(
        "min-w-0 w-full flex-row items-center",
        disabled && "opacity-50",
        className
      )}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <TouchableOpacity
        disabled={backDisabled}
        onPress={handleGoBack}
        className={cn(
          "h-10 w-8 shrink-0 bg-input rounded-sm items-center justify-center",
          backDisabled ? "opacity-50" : ""
        )}
      >
        <Icon
          name="chevron-left"
          color="text"
          opacity={backDisabled ? 50 : 100}
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
            <BreadcrumbCrumb
              key={item.id}
              item={item}
              isLast={isLast}
              onNavigate={onNavigate}
              disabled={disabled}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
