import React from "react";
import { cn } from "@/lib/cn";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { Icon } from "./icons/icon";

type DateProps = {
  date?: string | Date | null;
  lang?: "en" | "fr";
  showCalendarIcon?: boolean;
  className?: string;
  showYear?: boolean;
  size?: "sm" | "md";
};

export const DisplayDate: React.FC<DateProps> = ({
  date,
  showCalendarIcon = true,
  showYear = true,
  className,
  size = "sm",
}) => {
  if (!date) return;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return;

  const formatted = new Intl.DateTimeFormat(`en-CA`, {
    month: "short",
    year: showYear ? "numeric" : undefined,
    day: "2-digit",
  }).format(dateObj);

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 text-text opacity-40",
        className
      )}
    >
      {showCalendarIcon && <Icon name="calendar" size={14} color="text" />}
      <Typography className={cn(size === "sm" ? "text-xs" : "text-md")}>
        {formatted}
      </Typography>
    </View>
  );
};
