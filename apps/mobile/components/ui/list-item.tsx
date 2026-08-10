import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "expo-router";
import type { LinkProps } from "expo-router/build/link/Link";
import type React from "react";
import type { ElementType } from "react";
import {
  Pressable,
  type PressableProps,
  View,
  type ViewProps,
} from "react-native";
import { Muted } from "@/components/ui/typography";
import { ChevronRight } from "@/components/Icons";
import { cn } from "@/lib/cn";
import { Typography } from "@/components/ui/typography";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

const listItemTextVariants = cva(
  "text-base font-normal", // base styles
  {
    variants: {
      variant: {
        default: "text-foreground",
        primary: "text-primary",
        link: "text-blue-500",
        destructive: "text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ItemProps {
  className: string;
}

// Define props for ListItem with TypeScript interface
type ListItemProps = VariantProps<typeof listItemTextVariants> & {
  label: string;
  description?: React.ReactNode;
  itemLeft?: (itemProps: ItemProps) => React.ReactElement;
  itemRight?: (itemProps: ItemProps) => React.ReactElement;
  onPress?: () => void;
  noChevron?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  /**
   * If true, a detail arrow will appear on the item.
   */
  detail?: boolean;
  /**
   * Convert the default Pressable with a Link component.
   */
  href?: any;
  className?: string;
} & (ViewProps | PressableProps | LinkProps);

// ListItem component
const ListItem: React.FC<ListItemProps> = ({
  label,
  description,
  itemLeft,
  itemRight,
  detail = true,
  variant,
  className,
  href,
  noChevron = false,
  borderTop = false,
  borderBottom = true,
  ...props
}) => {
  const rightClassName = cn(
    "size-5 opacity-70",
    listItemTextVariants({ variant })
  );
  let rightContent: React.ReactNode;
  if (itemRight) {
    rightContent = itemRight({ className: rightClassName });
  } else if (!noChevron && ((props?.onPress && detail) || (href && detail))) {
    rightContent = <ChevronRight className={rightClassName} />;
  }
  const pressable = props?.onPress || href;
  // When href is provided, use View since Link will wrap it
  // When onPress is provided, use Pressable
  // Otherwise, use View
  const Component = (props?.onPress ? Pressable : View) as ElementType<
    ViewProps | PressableProps
  >;

  // Remove href from props if it exists, since it's handled separately
  const { ...componentProps } = props as any;

  const { colorScheme } = useColorScheme();
  const borderColor = hsl("border", colorScheme);
  const body = (
    <Component
      className={cn(
        "flex-row items-center justify-between w-full px-3 py-3",
        pressable ? "web:hover:opacity-90 active:opacity-90" : "",
        listItemTextVariants({ variant }),
        className
      )}
      accessibilityRole={pressable ? "button" : "none"}
      accessibilityLabel={`${label}${description ? `, ${description}` : ""}`}
      {...componentProps}
      style={{
        backgroundColor: hsl("card", colorScheme),
        borderColor,
        borderTopWidth: borderTop ? 1 : 0,
        borderBottomWidth: borderBottom ? 1 : 0,
      }}
    >
      {itemLeft && (
        <View className="mr-3">
          {itemLeft({
            className: cn("text-foreground", listItemTextVariants({ variant })),
          })}
        </View>
      )}
      <View className="flex-1">
        <Typography
          variant="h4"
          className={cn(listItemTextVariants({ variant }))}
        >
          {label}
        </Typography>
        {description ? (
          typeof description === "string" ? (
            <Muted>{description}</Muted>
          ) : (
            description
          )
        ) : undefined}
      </View>
      {rightContent}
    </Component>
  );
  if (href) {
    return (
      <Link href={href} asChild>
        {body}
      </Link>
    );
  } else {
    return body;
  }
};

export default ListItem;
