import * as React from "react";
import { StyleSheet, Text as RNText, type TextStyle } from "react-native";
import * as Slot from "@/components/primitives/slot";
import type {
  SlottableTextProps,
  TextRef,
} from "@/components/primitives/types";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import type { Theme } from "@repo/theme/global";

export const TextClassContext = React.createContext<string | undefined>(
  undefined
);

const variantFonts: Record<string, string> = {
  body: "QuicksandRegular",
  h1: "QuicksandRegular",
  h2: "QuicksandBold",
  h3: "QuicksandBold",
  h4: "QuicksandBold",
  h5: "QuicksandBold",
  p: "QuicksandRegular",
  span: "QuicksandRegular",
  lead: "QuicksandRegular",
  large: "QuicksandRegular",
  small: "QuicksandRegular",
  muted: "QuicksandRegular",
  blockquote: "QuicksandRegular",
  code: "QuicksandRegular",
  date: "QuicksandRegular",
};

const variantClasses = {
  h1: "web:scroll-m-20 text-4xl tracking-tight lg:text-5xl",
  h2: "web:scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "web:scroll-m-20 text-xl font-semibold tracking-tight",
  h4: "web:scroll-m-20 text-lg font-semibold tracking-tight",
  h5: "web:scroll-m-20 text-md font-semibold tracking-tight",
  p: "text-base font-normal",
  span: "text-base font-normal",
  lead: "text-xl text-muted-foreground",
  large: "text-xl font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
  blockquote:
    "mt-6 native:mt-4 border-l-2 border-border pl-6 native:pl-3 text-base italic",
  code: "relative rounded-md bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold",
  date: "text-sm uppercase tracking-wide opacity-80",
} as const;

const paddingClasses: Record<string, string> = {
  h1: "pb-10",
  h2: "pb-8",
  h3: "pb-3",
  h4: "pb-1",
  h5: "pb-1",
  p: "pb-2",
  span: "pb-0",
  lead: "pb-4",
  large: "pb-4",
  small: "pb-2",
  muted: "pb-2",
  blockquote: "pb-2",
  code: "pb-2",
  date: "pb-2",
};

const ariaLevels: Partial<Record<string, number>> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
};

type TypographyVariant = keyof typeof variantClasses;

/** Strip theme color utilities only — keep text-xl / text-sm / etc. */
const TEXT_COLOR_CLASS_RE =
  /\b(?:native:)?text-(?:foreground|muted-foreground|primary-foreground|primary|secondary-foreground|secondary|destructive-foreground|destructive|popover-foreground|popover|card-foreground|card|footer-foreground|footer|accent-foreground|accent)\b/g;

function withoutTextColorClasses(value?: string) {
  return value?.replace(TEXT_COLOR_CLASS_RE, "").replace(/\s+/g, " ").trim();
}

function resolveColorToken(
  variant: TypographyVariant | undefined,
  ...classSources: Array<string | undefined>
): Theme {
  const joined = classSources.filter(Boolean).join(" ");
  if (joined.includes("popover-foreground")) return "popover-foreground";
  if (joined.includes("primary-foreground")) return "primary-foreground";
  if (joined.includes("secondary-foreground")) return "secondary-foreground";
  if (joined.includes("destructive-foreground"))
    return "destructive-foreground";
  if (joined.includes("card-foreground")) return "card-foreground";
  if (joined.includes("footer-foreground")) return "footer-foreground";
  if (joined.includes("muted-foreground")) return "muted-foreground";
  if (joined.includes("accent-foreground") || /\btext-accent\b/.test(joined)) {
    return "foreground";
  }
  if (/\btext-primary\b/.test(joined)) return "primary";
  if (/\btext-destructive\b/.test(joined)) return "destructive";
  if (/\btext-secondary\b/.test(joined)) return "secondary";
  if (variant === "muted" || variant === "lead") return "muted-foreground";
  return "foreground";
}

export interface TypographyProps extends SlottableTextProps {
  variant?: TypographyVariant;
  padding?: boolean;
  asChild?: boolean;
  className?: string;
}

const Typography = React.forwardRef<TextRef, TypographyProps>(
  (
    {
      variant = "p",
      padding = false,
      asChild = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot.Text : RNText;
    const textClass = React.useContext(TextClassContext);
    const { colorScheme } = useColorScheme();
    const scheme = colorScheme === "dark" ? "dark" : "light";
    const flatStyle = StyleSheet.flatten(style);
    const hasExplicitColor = flatStyle?.color != null;
    const colorToken = resolveColorToken(variant, textClass, className);
    const resolvedColor = hasExplicitColor
      ? undefined
      : hsl(colorToken, "theme", scheme);

    return (
      <Component
        className={cn(
          "web:select-text",
          withoutTextColorClasses(textClass),
          variant && withoutTextColorClasses(variantClasses[variant]),
          padding && variant && paddingClasses[variant],
          withoutTextColorClasses(className)
        )}
        style={[
          {
            fontFamily: variantFonts[variant],
            textAlignVertical: "center",
            includeFontPadding: true,
          } as TextStyle,
          style,
          // Theme color last so it wins over NativeWind token classes.
          resolvedColor ? ({ color: resolvedColor } as TextStyle) : null,
        ]}
        aria-level={ariaLevels[variant]}
        ref={ref}
        {...props}
      />
    );
  }
);

Typography.displayName = "Typography";

const H1 = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="h1" ref={ref} {...props} />
));
const H2 = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="h2" ref={ref} {...props} />
));
const H3 = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="h3" ref={ref} {...props} />
));
const H4 = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="h4" ref={ref} {...props} />
));
const P = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="p" ref={ref} {...props} />
));
const Span = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="span" ref={ref} {...props} />
));
const Lead = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="lead" ref={ref} {...props} />
));
const Large = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="large" ref={ref} {...props} />
));
const Small = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="small" ref={ref} {...props} />
));
const Muted = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="muted" ref={ref} {...props} />
));
const BlockQuote = React.forwardRef<TextRef, SlottableTextProps>(
  (props, ref) => <Typography variant="blockquote" ref={ref} {...props} />
);
const Code = React.forwardRef<TextRef, SlottableTextProps>((props, ref) => (
  <Typography variant="code" ref={ref} {...props} />
));

export {
  Typography,
  H1,
  H2,
  H3,
  H4,
  P,
  Span,
  Lead,
  Large,
  Small,
  Muted,
  BlockQuote,
  Code,
};
