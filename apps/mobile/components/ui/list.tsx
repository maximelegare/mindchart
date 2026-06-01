import React from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

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
}

const List: React.FC<ListProps> = ({ children, className, ...props }) => {
  const childrenArray = React.Children.toArray(children);
  const modifiedChildren = childrenArray.map((child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    let injectClassName = "";
    const isFirstChild = index === 0;
    const isLastChild = index === childrenArray.length - 1;

    // if first child or the previous sibling is a ListHeader
    const prevSibling = childrenArray[index - 1];
    const isValidPrevSibling = React.isValidElement(prevSibling);
    if (
      isFirstChild ||
      (isValidPrevSibling && prevSibling.type === ListHeader)
    ) {
      injectClassName += "rounded-t-lg "; // whitespace is important
    }
    if (isLastChild) {
      injectClassName += "rounded-b-lg border-b-0";
    }

    return React.cloneElement<any>(child, {
      className: cn(
        (child as React.ReactElement<any>).props.className,
        injectClassName
      ),
    });
  });

  return (
    <View
      className={
        cn("border-input border-[1px] rounded-lg overflow-hidden", className) ||
        ""
      }
      accessibilityRole="list"
      accessibilityLabel="List of items"
      {...props}
    >
      {modifiedChildren}
    </View>
  );
};

export default List;
