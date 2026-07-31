import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/cn";
import { hsl } from "@/utils/hsl";
import capitalize from "@/utils/stringManipulations/capitalize";
import { useGraphStore } from "../../context/graphContext";
import {
  resolveListItemCategoryShade,
  resolveNodeCategoryKey,
} from "../../utils/resolveNodeCategoryKey";
import type { GraphMode, NodeDatum } from "../../types/types";

const MAX_TITLE_LENGTH = 40;
const ICON_SLOT = 14;
const BULLET_SIZE = 6;
const ROW_GAP = 6;
/** Horizontal inset shared by the layer header and its child tree rail. */
const HEADER_INSET = 6;
/** Horizontal run from the parent-icon rail into the child row. */
const ELBOW_WIDTH = 12;
const LINE_WIDTH = Math.max(StyleSheet.hairlineWidth * 2, 1);
const HAIRLINE = StyleSheet.hairlineWidth;
/** Space between separate thoughts (not between a title and its summary). */
const THOUGHT_BLOCK_GAP = 14;
const TITLE_SUMMARY_GAP = 0;

const formatTitle = (value: string, maxLength = MAX_TITLE_LENGTH) => {
  const title = capitalize(value || "");
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength)}…`;
};

const isThoughtLeaf = (node: NodeDatum) => !!node.thoughtId;

const isFolderNode = (node: NodeDatum) =>
  !!node.folderId || node.id.startsWith("folder-");

const isCategoryNode = (node: NodeDatum) => node.id.startsWith("category-");

const NodeKindIcon = ({
  node,
  graphMode,
}: {
  node: NodeDatum;
  graphMode: GraphMode;
}) => {
  if (isCategoryNode(node)) {
    return <Icon name="shapes" color="muted-foreground" size={ICON_SLOT} />;
  }
  if (graphMode === "folder" || isFolderNode(node)) {
    return <Icon name="folder" color="muted-foreground" size={ICON_SLOT} />;
  }
  return <Icon name="shapes" color="muted-foreground" size={ICON_SLOT} />;
};

/** Same width as every row icon — rails are drawn in this column under the parent. */
const IconColumn = ({ children }: { children: React.ReactNode }) => (
  <View
    className="items-center justify-center shrink-0"
    style={{ width: ICON_SLOT }}
  >
    {children}
  </View>
);

const RailSegment = ({
  lineColor,
  top,
  bottom,
}: {
  lineColor: string;
  top: number | `${number}%`;
  bottom: number | `${number}%`;
}) => (
  <View
    style={{
      position: "absolute",
      left: ICON_SLOT / 2 - LINE_WIDTH / 2,
      top,
      bottom,
      width: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const Elbow = ({ lineColor }: { lineColor: string }) => (
  <View
    style={{
      position: "absolute",
      left: ICON_SLOT / 2 - LINE_WIDTH / 2,
      top: "50%",
      marginTop: -LINE_WIDTH / 2,
      width: ICON_SLOT / 2 + ELBOW_WIDTH,
      height: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

type NodeParts = {
  header: React.ReactNode;
  nested?: React.ReactNode;
};

/**
 * Children list under a parent row.
 * Guide column width === parent IconColumn, so the rail is centered on the parent icon.
 * Elbows are measured against the header row only (not the full subtree).
 */
const NestedChildren = ({
  lineColor,
  nodes,
  renderNode,
}: {
  lineColor: string;
  nodes: NodeDatum[];
  renderNode: (node: NodeDatum) => NodeParts;
}) => (
  <View>
    {nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const { header, nested } = renderNode(node);

      return (
        <View key={node.id}>
          <View className="flex-row items-center">
            <View style={{ width: ICON_SLOT, alignSelf: "stretch" }}>
              <RailSegment
                lineColor={lineColor}
                top={0}
                bottom={isLast ? "50%" : 0}
              />
              <Elbow lineColor={lineColor} />
            </View>
            <View
              className="flex-1 min-w-0"
              style={{ marginLeft: ELBOW_WIDTH }}
            >
              {header}
            </View>
          </View>

          {nested ? (
            <View className="flex-row">
              <View style={{ width: ICON_SLOT, alignSelf: "stretch" }}>
                {!isLast ? (
                  <RailSegment lineColor={lineColor} top={0} bottom={0} />
                ) : null}
              </View>
              <View
                className="flex-1 min-w-0"
                style={{ marginLeft: ELBOW_WIDTH }}
              >
                {nested}
              </View>
            </View>
          ) : null}
        </View>
      );
    })}
  </View>
);

type SelectedLayerCardProps = {
  layerRoot: NodeDatum;
  currentNodeId: string;
  focusedThoughtId?: string;
};

export const SelectedLayerCard: React.FC<SelectedLayerCardProps> = ({
  layerRoot,
  currentNodeId,
  focusedThoughtId,
}) => {
  const { colorScheme } = useColorScheme();
  const { setParams, push } = useRouter();
  const graphMode = useGraphStore((state) => state.mode);
  const highlightColor = hsl("border", colorScheme);
  const lineColor = hsl("border", colorScheme);

  const categoryKey = resolveNodeCategoryKey(layerRoot);
  const showMainStripe = graphMode === "category";
  const stripeColor = categoryKey
    ? hsl(
        categoryKey,
        colorScheme,
        resolveListItemCategoryShade("root"),
        "categories"
      )
    : hsl("border", colorScheme);

  const navigateToNode = (nodeId: string) => {
    setParams({
      id: nodeId,
      _t: Date.now().toString(),
    });
  };

  const navigateToNote = (noteId?: string) => {
    if (!noteId) return;
    push({
      pathname: "/notes/[id]",
      params: { id: noteId },
    });
  };

  const isLayerCurrent = layerRoot.id === currentNodeId;
  const children = layerRoot.children ?? [];

  const cardRadius = 8;

  return (
    <Card
      className="w-full overflow-hidden rounded-lg"
      style={{ borderRadius: cardRadius, overflow: "hidden" }}
    >
      <View className="w-full flex-row" style={{ overflow: "hidden" }}>
        {showMainStripe ? (
          <View
            style={{
              width: 5,
              backgroundColor: stripeColor,
            }}
          />
        ) : null}
        <View className="flex-1 min-w-0 p-2">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ROW_GAP,
              paddingHorizontal: HEADER_INSET,
              paddingVertical: 4,
              borderRadius: cardRadius,
              // Keep borderWidth stable — toggling it collapses flex text on RN.
              borderWidth: HAIRLINE,
              borderColor: isLayerCurrent
                ? hsl("border", colorScheme)
                : "transparent",
              backgroundColor: isLayerCurrent ? highlightColor : "transparent",
            }}
          >
            <Pressable
              onPress={() => navigateToNode(layerRoot.id)}
              style={{
                flex: 1,
                minWidth: 0,
                flexDirection: "row",
                alignItems: "center",
                gap: ROW_GAP,
              }}
            >
              <IconColumn>
                <NodeKindIcon node={layerRoot} graphMode={graphMode} />
              </IconColumn>
              <Typography variant="h4" numberOfLines={1} style={{ flex: 1 }}>
                {formatTitle(
                  layerRoot.folderLabel ||
                    layerRoot.name ||
                    layerRoot.title ||
                    ""
                )}
              </Typography>
              {children.length ? (
                <Typography variant="p">({children.length})</Typography>
              ) : null}
              {isLayerCurrent ? (
                <View style={{ opacity: 0.45 }}>
                  <Icon
                    name="map-pin-simple"
                    color="muted-foreground"
                    size={12}
                  />
                </View>
              ) : null}
            </Pressable>
            {layerRoot.noteId ? (
              <Button
                className="h-9 w-9 p-0"
                variant="ghost"
                size="icon"
                onPress={() => navigateToNote(layerRoot.noteId)}
              >
                <Icon
                  size={20}
                  color="text"
                  name="notebook-text"
                  style={{ opacity: 0.8 }}
                />
              </Button>
            ) : null}
          </View>

          {children.length ? (
            <View
              style={{
                // Match the layer-root icon column (header inset + border).
                marginLeft: HEADER_INSET + HAIRLINE,
                marginTop: 4,
              }}
            >
              <NestedChildren
                lineColor={lineColor}
                nodes={children}
                renderNode={(child) =>
                  renderTreeNodeParts({
                    node: child,
                    currentNodeId,
                    focusedThoughtId,
                    highlightColor,
                    lineColor,
                    graphMode,
                    onNavigate: navigateToNode,
                    onOpenNote: navigateToNote,
                  })
                }
              />
            </View>
          ) : layerRoot.summary || isThoughtLeaf(layerRoot) ? (
            <View
              style={{
                marginLeft: HEADER_INSET + HAIRLINE,
                marginTop: 8,
              }}
            >
              {isThoughtLeaf(layerRoot) ? (
                <View>
                  <ThoughtTitleRow
                    node={layerRoot}
                    isCurrent={false}
                    isFocused={focusedThoughtId === layerRoot.thoughtId}
                    highlightColor={highlightColor}
                    onOpenNote={navigateToNote}
                  />
                  {layerRoot.summary ? (
                    <ThoughtSummary summary={layerRoot.summary} />
                  ) : null}
                </View>
              ) : (
                <Typography variant="p">{layerRoot.summary}</Typography>
              )}
            </View>
          ) : (
            <Typography
              className="opacity-50"
              variant="p"
              style={{
                marginLeft: HEADER_INSET + HAIRLINE,
                marginTop: 8,
              }}
            >
              No content
            </Typography>
          )}
        </View>
      </View>
    </Card>
  );
};

type RenderPartsArgs = {
  node: NodeDatum;
  currentNodeId: string;
  focusedThoughtId?: string;
  highlightColor: string;
  lineColor: string;
  graphMode: GraphMode;
  onNavigate: (nodeId: string) => void;
  onOpenNote: (noteId?: string) => void;
};

function renderTreeNodeParts({
  node,
  currentNodeId,
  focusedThoughtId,
  highlightColor,
  lineColor,
  graphMode,
  onNavigate,
  onOpenNote,
}: RenderPartsArgs): NodeParts {
  if (isThoughtLeaf(node)) {
    const isCurrent = node.id === currentNodeId;
    const isFocused = focusedThoughtId === node.thoughtId;
    const hasSummary = !!node.summary;
    return {
      header: (
        <ThoughtTitleRow
          node={node}
          isCurrent={isCurrent}
          isFocused={isFocused}
          highlightColor={highlightColor}
          onOpenNote={onOpenNote}
          compactBottom={hasSummary}
        />
      ),
      nested: (
        <View style={{ paddingBottom: THOUGHT_BLOCK_GAP }}>
          {hasSummary ? <ThoughtSummary summary={node.summary!} /> : null}
        </View>
      ),
    };
  }

  const isCurrent = node.id === currentNodeId;
  const children = node.children ?? [];

  return {
    header: (
      <Pressable
        onPress={() => onNavigate(node.id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: ROW_GAP,
          paddingVertical: 6,
          paddingRight: 8,
          borderRadius: 8,
          borderWidth: HAIRLINE,
          borderColor: isCurrent ? highlightColor : "transparent",
          backgroundColor: isCurrent ? highlightColor : "transparent",
        }}
        accessibilityRole="button"
        accessibilityLabel={`Zoom to ${node.name || "group"}`}
      >
        <IconColumn>
          <NodeKindIcon node={node} graphMode={graphMode} />
        </IconColumn>
        <Typography
          variant="small"
          className={cn("flex-1", isCurrent && "font-semibold")}
          numberOfLines={1}
        >
          {formatTitle(node.name || node.title || "", 35)}
        </Typography>
        {children.length > 0 ? (
          <Typography variant="p" className="text-xs opacity-60">
            {children.length}
          </Typography>
        ) : null}
        {isCurrent ? (
          <View style={{ opacity: 0.45 }}>
            <Icon name="map-pin-simple" color="muted-foreground" size={12} />
          </View>
        ) : null}
      </Pressable>
    ),
    nested:
      children.length > 0 ? (
        <NestedChildren
          lineColor={lineColor}
          nodes={children}
          renderNode={(child) =>
            renderTreeNodeParts({
              node: child,
              currentNodeId,
              focusedThoughtId,
              highlightColor,
              lineColor,
              graphMode,
              onNavigate,
              onOpenNote,
            })
          }
        />
      ) : undefined,
  };
}

type ThoughtTitleRowProps = {
  node: NodeDatum;
  isCurrent: boolean;
  isFocused: boolean;
  highlightColor: string;
  onOpenNote: (noteId?: string) => void;
  /** When true, drop bottom padding so the summary sits tight under the title. */
  compactBottom?: boolean;
};

const ThoughtTitleRow: React.FC<ThoughtTitleRowProps> = ({
  node,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
  compactBottom = false,
}) => {
  const { colorScheme } = useColorScheme();
  const bulletColor = hsl("muted-foreground", colorScheme);
  const emphasized = isCurrent || isFocused;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: ROW_GAP,
        paddingTop: 4,
        paddingBottom: compactBottom ? 0 : 4,
        paddingRight: 4,
        borderRadius: 8,
        borderWidth: HAIRLINE,
        borderColor: emphasized ? highlightColor : "transparent",
        backgroundColor: emphasized ? highlightColor : "transparent",
      }}
    >
      <IconColumn>
        <View
          className="rounded-full"
          style={{
            width: BULLET_SIZE,
            height: BULLET_SIZE,
            backgroundColor: bulletColor,
          }}
        />
      </IconColumn>
      <Typography
        variant="h5"
        className={cn(
          "flex-1 pb-0 leading-tight",
          emphasized && "font-semibold"
        )}
        style={{ includeFontPadding: false }}
        numberOfLines={2}
      >
        {formatTitle(node.title || node.name || "")}
      </Typography>
      {emphasized ? (
        <View style={{ opacity: 0.45 }}>
          <Icon name="map-pin-simple" color="muted-foreground" size={12} />
        </View>
      ) : null}
      {node.noteId ? (
        <Button
          className="h-8 w-8 p-0"
          variant="ghost"
          size="icon"
          onPress={() => onOpenNote(node.noteId)}
        >
          <Icon
            size={18}
            color="text"
            name="notebook-text"
            style={{ opacity: 0.8 }}
          />
        </Button>
      ) : null}
    </View>
  );
};

const ThoughtSummary = ({ summary }: { summary: string }) => (
  <Typography
    variant="p"
    className="pb-0 leading-snug pr-1"
    style={{
      includeFontPadding: false,
      marginTop: TITLE_SUMMARY_GAP,
      paddingLeft: ICON_SLOT + ROW_GAP,
    }}
  >
    {summary}
  </Typography>
);
