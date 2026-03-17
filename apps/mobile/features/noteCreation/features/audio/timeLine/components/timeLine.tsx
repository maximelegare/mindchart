import React from "react";
import { View } from "react-native";
import { SIZE } from "./constants";
import { FixedLayout } from "./fixedLayout";
import { VerticalLines } from "./verticalLine";

type TimeLineProps = {
  metering?: number;
  isRecording?: boolean;
};

export const TimeLine = ({
  metering = 0,
  isRecording = false,
}: TimeLineProps) => {
  return (
    <View className="w-full relative overflow-hidden" style={{ height: SIZE }}>
      <FixedLayout />
      <VerticalLines metering={metering} isRecording={isRecording} />
    </View>
  );
};
