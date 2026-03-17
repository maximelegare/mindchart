import { View } from "react-native";
import { Gutter } from "@/components/ui/gutter";
import React from "react";
import { HeaderContent } from "@/components/layout/shared/headerContent";

import type { NativeStackHeaderProps } from "@react-navigation/native-stack";

type CustomHeader = {
  route: NativeStackHeaderProps["route"];
  options: NativeStackHeaderProps["options"];
};

export default function CustomHeader({ options }: CustomHeader) {
  return (
    <View className="-z-10 absolute w-full rounded-b-[10px] overflow-hidden">
      <Gutter size="sm">
        <HeaderContent title={options.title || "Page"} />
      </Gutter>
    </View>
  );
}
