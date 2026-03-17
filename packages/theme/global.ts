const NAV_FONT_FAMILY = "Quicksand";

export const THEME_CONFIG = {
  light: {
    background: "145, 35%, 92%", // slightly greener, still light
    foreground: "150, 45%, 14%", // deep green instead of flat dark

    card: "145, 30%, 95%", // subtle green tint
    "card-foreground": "150, 45%, 14%",

    popover: "150, 45%, 14%", // matches logo dark
    "popover-foreground": "145, 35%, 92%",

    primary: "145, 45%, 42%", // main logo green
    "primary-foreground": "145, 35%, 95%",

    secondary: "155, 35%, 30%", // slightly bluish-green (depth)
    "secondary-foreground": "145, 35%, 95%",

    muted: "145, 20%, 88%", // keep light but greener
    "muted-foreground": "150, 15%, 45%",

    destructive: "357, 90%, 94%",
    "destructive-foreground": "3, 85%, 55%",

    border: "145, 25%, 80%",
    input: "145, 25%, 80%",
    ring: "145, 45%, 45%",
  },

  dark: {
    background: "155 35% 8%",
    foreground: "140 25% 92%",

    card: "155 30% 10%",
    "card-foreground": "140 25% 92%",

    popover: "155 30% 10%",
    "popover-foreground": "140 25% 92%",

    primary: "145 45% 55%",
    "primary-foreground": "155 35% 10%",

    secondary: "155 25% 18%",
    "secondary-foreground": "140 25% 92%",

    muted: "155 20% 16%",
    "muted-foreground": "145 15% 65%",

    destructive: "0 72% 51%",
    "destructive-foreground": "0 0% 98%",

    border: "155 20% 18%",
    input: "155 20% 18%",
    ring: "145 50% 50%",
  },
} as const;

export const NAV_THEME = {
  light: {
    background: `hsl(${THEME_CONFIG.light.background})`, // background
    border: `hsl(${THEME_CONFIG.light.border})`, // border
    card: `hsl(${THEME_CONFIG.light.card})`, // card
    notification: `hsl(${THEME_CONFIG.light.destructive})`, // destructive
    primary: `hsl(${THEME_CONFIG.light.primary})`, // primary
    text: `hsl(${THEME_CONFIG.light.foreground})`, // foreground
  },
  dark: {
    background: `hsl(${THEME_CONFIG.dark.background})`, // background
    border: `hsl(${THEME_CONFIG.dark.border})`, // border
    card: `hsl(${THEME_CONFIG.dark.card})`, // card
    notification: `hsl(${THEME_CONFIG.dark.foreground})`, // destructive
    primary: `hsl(${THEME_CONFIG.dark.primary})`, // primary
    text: `hsl(${THEME_CONFIG.dark.foreground})`, // foreground
  },
} as const;

export const LIGHT_THEME = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "500",
    },
    bold: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "800",
    },
  },
  colors: NAV_THEME.light,
};

export const DARK_THEME = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "500",
    },
    bold: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "800",
    },
  },
  colors: NAV_THEME.dark,
};

export type Theme = keyof typeof THEME_CONFIG.dark;
export type ColorScheme = keyof typeof NAV_THEME | "system" | "custom";
