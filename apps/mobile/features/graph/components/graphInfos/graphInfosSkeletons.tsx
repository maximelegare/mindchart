import { View, StyleSheet } from "react-native";
import { Skeleton, SkeletonPulse } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

const GUIDE_WIDTH = 14;
const ELBOW_WIDTH = 4;
const LINE_WIDTH = Math.max(StyleSheet.hairlineWidth * 2, 1);
const BAR_HEIGHT = 10;

type TreeSkeletonNode = {
  width: `${number}%`;
  children?: TreeSkeletonNode[];
};

const TREE_LAYOUT: TreeSkeletonNode[] = [
  { width: "78%" },
  {
    width: "64%",
    children: [{ width: "72%" }, { width: "50%" }, { width: "62%" }],
  },
  {
    width: "70%",
    children: [{ width: "44%" }, { width: "68%" }],
  },
  { width: "58%" },
];

const NOTE_LAYOUTS: { title: `${number}%`; bullets: `${number}%`[] }[] = [
  { title: "72%", bullets: ["92%", "78%", "64%"] },
  { title: "54%", bullets: ["88%", "70%", "82%", "52%"] },
  { title: "80%", bullets: ["76%", "90%"] },
];

const NoteSkeletonCard = ({
  title,
  bullets,
}: {
  title: `${number}%`;
  bullets: `${number}%`[];
}) => (
  <View className="w-full rounded-2xl p-3.5 pb-4">
    <View className="mb-2" style={{ width: 88, height: 12 }}>
      <Skeleton className="h-full w-full rounded-sm" />
    </View>
    <View className="flex-row items-start justify-between gap-2">
      <View className="flex-1" style={{ height: 22 }}>
        <View style={{ width: title, height: 22 }}>
          <Skeleton className="h-full w-full rounded-sm" />
        </View>
      </View>
      <View style={{ width: 16, height: 16, marginTop: 4 }}>
        <Skeleton className="h-full w-full rounded-sm" />
      </View>
    </View>
    <View className="mt-4 ml-2">
      {bullets.map((width, index) => (
        <View
          key={index}
          className="flex-row items-center"
          style={{ marginBottom: 10 }}
        >
          <View
            style={{
              width: 16,
              height: 22,
              marginRight: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
          </View>
          <View className="flex-1" style={{ height: 12 }}>
            <View style={{ width, height: 12 }}>
              <Skeleton className="h-full w-full rounded-sm" />
            </View>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const Rail = ({
  lineColor,
  top,
  bottom,
  height,
}: {
  lineColor: string;
  top: number | `${number}%`;
  bottom?: number | `${number}%`;
  height?: number;
}) => (
  <View
    style={{
      position: "absolute",
      left: GUIDE_WIDTH / 2 - LINE_WIDTH / 2,
      top,
      ...(height != null ? { height } : { bottom: bottom ?? 0 }),
      width: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const Elbow = ({ lineColor }: { lineColor: string }) => (
  <View
    style={{
      position: "absolute",
      left: GUIDE_WIDTH / 2 - LINE_WIDTH / 2,
      top: "50%",
      marginTop: -LINE_WIDTH / 2,
      width: GUIDE_WIDTH / 2 + ELBOW_WIDTH,
      height: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const TreeSkeletonRows = ({
  nodes,
  lineColor,
}: {
  nodes: TreeSkeletonNode[];
  lineColor: string;
}) => (
  <View>
    {nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const nested = node.children;

      return (
        <View key={index}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: GUIDE_WIDTH, alignSelf: "stretch" }}>
              <Rail lineColor={lineColor} top={0} bottom={isLast ? "50%" : 0} />
              <Elbow lineColor={lineColor} />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: ELBOW_WIDTH,
                marginVertical: 8,
              }}
            >
              <View style={{ width: node.width, height: BAR_HEIGHT }}>
                <Skeleton className="h-full w-full rounded-sm" />
              </View>
            </View>
          </View>
          {nested ? (
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: GUIDE_WIDTH, alignSelf: "stretch" }}>
                {!isLast ? (
                  <Rail lineColor={lineColor} top={0} bottom={0} />
                ) : null}
              </View>
              <View
                className="flex-1 min-w-0"
                style={{ marginLeft: ELBOW_WIDTH }}
              >
                <TreeSkeletonRows nodes={nested} lineColor={lineColor} />
              </View>
            </View>
          ) : null}
        </View>
      );
    })}
  </View>
);

export const GraphInfosNotesSkeleton = () => (
  <SkeletonPulse
    className="mt-3"
    accessibilityRole="progressbar"
    accessibilityLabel="Loading notes"
  >
    {NOTE_LAYOUTS.map((layout, index) => (
      <View key={index}>
        {index > 0 ? <Separator className="my-3" /> : null}
        <NoteSkeletonCard title={layout.title} bullets={layout.bullets} />
      </View>
    ))}
  </SkeletonPulse>
);

export const GraphInfosTreeSkeleton = () => {
  const { colorScheme } = useColorScheme();
  const lineColor = hsl("border", colorScheme);

  return (
    <SkeletonPulse
      className="mt-1"
      accessibilityRole="progressbar"
      accessibilityLabel="Loading folder tree"
    >
      <TreeSkeletonRows nodes={TREE_LAYOUT} lineColor={lineColor} />
    </SkeletonPulse>
  );
};
