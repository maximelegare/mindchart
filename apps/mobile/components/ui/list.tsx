import React from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

interface ListHeaderProps extends ViewProps {
  children: React.ReactNode;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <View className={cn("py-1.5 px-4 text-background", className)} {...props}>
      {children}
    </View>
  );
};

interface ListProps extends ViewProps {
  children: React.ReactNode;
  /**
   * - `default`: bordered card list
   * - `plain`: no chrome
   * - `grouped`: card fill + large radius, no outer border (settings)
   */
  variant?: "default" | "plain" | "grouped";
}

const GROUPED_RADIUS = 22;

const List: React.FC<ListProps> = ({
  children,
  className,
  variant = "default",
  ...props
}) => {
  const { colorScheme } = useColorScheme();
  const plain = variant === "plain";
  const grouped = variant === "grouped";
  const transparentRows = plain || grouped;

  // Omit null/false children so Android never gets empty native slots in the list ViewGroup.
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const modifiedChildren = childrenArray.map((child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    let injectClassName = "";
    const isLastChild = index === childrenArray.length - 1;
    const isFirstChild = index === 0;
    const prevSibling = childrenArray[index - 1];
    const isValidPrevSibling = React.isValidElement(prevSibling);

    if (variant === "default") {
      if (
        isFirstChild ||
        (isValidPrevSibling && prevSibling.type === ListHeader)
      ) {
        injectClassName += "rounded-t-lg ";
      }
      if (isLastChild) {
        injectClassName += "rounded-b-lg border-b-0";
      }
    } else if (isLastChild) {
      // Drop the trailing divider under the last row.
      injectClassName += "border-b-0";
    }

    return React.cloneElement<any>(child, {
      className: cn(
        (child as React.ReactElement<any>).props.className,
        injectClassName
      ),
      ...(transparentRows ? { surface: "none" as const } : null),
    });
  });

  const { style, ...rest } = props;

  return (
    <View
      className={cn(
        (variant === "default" || grouped) && "overflow-hidden",
        className
      )}
      style={[
        variant === "default"
          ? {
              borderWidth: 1,
              borderColor: hsl("border", colorScheme),
              borderRadius: 8,
            }
          : grouped
            ? {
                borderWidth: 0,
                backgroundColor: hsl("card", colorScheme),
                borderRadius: GROUPED_RADIUS,
              }
            : { borderWidth: 0, backgroundColor: "transparent" },
        style,
      ]}
      accessibilityRole="list"
      accessibilityLabel="List of items"
      {...rest}
    >
      {modifiedChildren}
    </View>
  );
};

export default List;
