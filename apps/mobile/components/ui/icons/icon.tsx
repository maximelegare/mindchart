import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { ICON_METADATA, IconName } from "./icon-registry";
import { hsl } from "@/utils/hsl";
import { Theme } from "@repo/theme/global";
import { useColorScheme } from "@/lib/useColorScheme";

interface IconProps {
  name: IconName;
  size?: number;
  opacity?: number;
  color?: Theme;
  hslColor?: string;
  style?: StyleProp<ViewStyle>;
  // className?: string;
}
export const Icon = ({
  name,
  size = 24,
  opacity = 100,
  color = "primary",
  style,
  hslColor,
  // className,
}: IconProps) => {
  const icon = ICON_METADATA[name];
  const { colorScheme } = useColorScheme();

  if (!icon) {
    console.warn(`Icon "${name}" not found in registry.`);
    return null;
  }

  const resolvedColor = hslColor ?? hsl(color, colorScheme);

  const xml = `
  <svg viewBox="${icon.viewBox}">
    <g
      fill="${resolvedColor}"
      stroke="${resolvedColor}"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    >
      ${icon.content}
    </g>
  </svg>
`;

  return (
    <SvgXml
      xml={xml}
      width={size}
      height={size}
      style={style}
      opacity={opacity / 100}
      // className={className}
    />
  );
};
