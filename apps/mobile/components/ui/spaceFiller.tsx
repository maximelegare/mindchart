import * as React from "react";
import { View, ViewStyle } from "react-native";
import { useSafeAreaInsets, EdgeInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/cn";
import { LAYOUT_SIZES } from "../layout/constants";

/* ────────────────────────────────────────────── */
/* Types                                          */
/* ────────────────────────────────────────────── */

type LayoutSizeKey = keyof typeof LAYOUT_SIZES;
type SafeAreaToken = "safeTop" | "safeBottom" | "safeLeft" | "safeRight";

/** A single value or a design token */
type SingleToken = LayoutSizeKey | SafeAreaToken | number;

/** Support for recursive arrays for additive spacing: e.g., ["md", "safeTop"] */
type SizeToken = SingleToken | readonly SizeToken[];

type LayoutStyleKeys =
  | "paddingTop"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
  | "marginTop"
  | "marginBottom"
  | "marginLeft"
  | "marginRight"
  | "height"
  | "width";

export type LayoutSizesProp = Partial<Record<LayoutStyleKeys, SizeToken>>;

/* ────────────────────────────────────────────── */
/* Helpers                                        */
/* ────────────────────────────────────────────── */

const resolveSingleToken = (token: SingleToken, insets: EdgeInsets): number => {
  if (typeof token === "number") return token;

  const safeMap: Record<SafeAreaToken, number> = {
    safeTop: insets.top,
    safeBottom: insets.bottom,
    safeLeft: insets.left,
    safeRight: insets.right,
  };

  if (token in safeMap) return safeMap[token as SafeAreaToken];

  // Must be a LayoutSizeKey
  return LAYOUT_SIZES[token as LayoutSizeKey] ?? 0;
};

const resolveToken = (token: SizeToken, insets: EdgeInsets): number => {
  if (Array.isArray(token)) {
    return token.reduce<number>((sum, t) => sum + resolveToken(t, insets), 0);
  }
  return resolveSingleToken(token as SingleToken, insets);
};

/* ────────────────────────────────────────────── */
/* Component                                     */
/* ────────────────────────────────────────────── */

export const SpaceFiller = ({
  sizes,
  className,
}: {
  sizes?: LayoutSizesProp;
  className?: string;
}) => {
  const insets = useSafeAreaInsets();

  const style = React.useMemo(() => {
    if (!sizes) return undefined;

    const resolvedStyle: ViewStyle = {};

    // Using a typed cast on keys to ensure we can assign numbers safely
    (Object.keys(sizes) as Array<keyof LayoutSizesProp>).forEach((key) => {
      const value = sizes[key];
      if (value !== undefined && value !== null) {
        // Necessary because ViewStyle keys are highly specific string unions, but we know these specific keys accept numbers.
        resolvedStyle[key] = resolveToken(value, insets);
      }
    });

    return resolvedStyle;
  }, [sizes, insets]);

  return <View style={style} className={cn(className)} />;
};
