import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { StyleProp, View, ViewStyle } from "react-native";
import { cn } from "@/lib/cn";
import { ColorScheme } from "@repo/theme/global";
import { hsl } from "@/utils/hsl";

export type Variant = "primary" | "destructive" | "none";
export type GradientType = "linear" | "radial";

type GradientProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: Variant;
  type?: GradientType;
  style?: StyleProp<ViewStyle>;
  theme: ColorScheme;
  custom?: [string, string];
};

export function Gradient({
  children,
  className,
  variant = "none",
  type = "linear",
  style,
  theme,
  custom,
}: GradientProps) {
  const isDark = theme === "dark";

  const gradientColors: Record<Exclude<Variant, "none">, [string, string]> = {
    primary: isDark
      ? [
          // Footer (tab bar) → darker green
          hsl("footer", "theme", "dark"),
          "hsl(150, 45%, 11%)",
        ]
      : [
          hsl("foreground", "theme", "light"),
          hsl("primary", "theme", "light", 45),
        ],
    destructive: ["#ed333b", "#a51d2d"],
  };

  if (variant === "none" && !custom) {
    return <>{children}</>;
  }

  const colors = custom ?? gradientColors[variant as Exclude<Variant, "none">];

  if (type === "radial") {
    return (
      <View className={cn("relative overflow-hidden", className)}>
        <RadialGradientView colors={colors} />
        {children && children}
      </View>
    );
  }

  // linear (default)
  return (
    <LinearGradient
      style={style}
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={cn("w-full h-full", className)}
    >
      {children}
    </LinearGradient>
  );
}

export function RadialGradientView({
  colors,
  scale = 3, // make it 3x bigger than container
}: {
  colors: [string, string];
  scale?: number;
}) {
  return (
    <Svg
      width={`${scale * 200}%`}
      height={`${scale * 200}%`}
      style={{
        position: "absolute",
        top: `${-(scale - 1) * 100}%`,
        left: `${-(scale - 1) * 100}%`,
      }}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
          <Stop offset="60%" stopColor={colors[0]} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  );
}
