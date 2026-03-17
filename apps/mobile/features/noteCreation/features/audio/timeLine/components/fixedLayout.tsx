import React from "react";
import { View } from "react-native";
import { BAR, SIZE } from "./constants";

export const FixedLayout = () => {
  return (
    <>
      <View
        className="absolute bg-border w-full"
        style={{
          height: BAR,
          top: (SIZE - BAR) / 2,
        }}
      />

      <View
        className="absolute h-full"
        style={{
          width: BAR,
          left: "50%",
          marginLeft: -BAR / 2,
          borderLeftWidth: BAR,
          borderLeftColor: "red",
          borderStyle: "dotted",
        }}
      />
    </>
  );
};
