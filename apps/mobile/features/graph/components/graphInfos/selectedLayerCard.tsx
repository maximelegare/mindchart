import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
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
const CHEVRON_SLOT = 22;
const BULLET_SIZE = 6;
const ROW_GAP = 6;
/** Horizontal inset shared by the layer header and its child tree rail. */
const HEADER_INSET = 6;
/** Short horizontal run from the rail into the row — keep tight to free content width. */
const ELBOW_WIDTH = 4;
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

/** Folder-mode leaves: note id without thoughtId. */
const isNoteLeaf = (node: NodeDatum) => !!node.noteId && !node.thoughtId;

const isFolderNode = (node: NodeDatum) =>
  !isNoteLeaf(node) && (!!node.folderId || node.id.startsWith("folder-"));

const isCategoryNode = (node: NodeDatum) => node.id.startsWith("category-");

const NodeKindIcon = ({
  node,
  graphMode,
}: {
  node: NodeDatum;
  graphMode: GraphMode;
}) => {
  if (isNoteLeaf(node)) {
    return (
      <Icon name="notebook-text" color="muted-foreground" size={ICON_SLOT} />
    );
  }
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
  guideWidth,
}: {
  lineColor: string;
  top: number | `${number}%`;
  bottom: number | `${number}%`;
  guideWidth: number;
}) => (
  <View
    style={{
      position: "absolute",
      left: guideWidth / 2 - LINE_WIDTH / 2,
      top,
      bottom,
      width: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const Elbow = ({
  lineColor,
  guideWidth,
}: {
  lineColor: string;
  guideWidth: number;
}) => (
  <View
    style={{
      position: "absolute",
      left: guideWidth / 2 - LINE_WIDTH / 2,
      top: "50%",
      marginTop: -LINE_WIDTH / 2,
      width: guideWidth / 2 + ELBOW_WIDTH,
      height: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const containsNode = (node: NodeDatum, targetId: string): boolean => {
  if (
    node.id === targetId ||
    node.thoughtId === targetId ||
    node.noteId === targetId ||
    node.id === `note-${targetId}` ||
    node.relatedThoughtIds?.includes(targetId)
  ) {
    return true;
  }
  return (node.children ?? []).some((child) => containsNode(child, targetId));
};

type TreeCtx = {
  currentNodeId: string;
  focusedThoughtId?: string;
  highlightColor: string;
  lineColor: string;
  graphMode: GraphMode;
  onNavigate: (nodeId: string) => void;
  onOpenNote: (noteId?: string) => void;
};

type NoteTitleRowProps = {
  node: NodeDatum;
  isCurrent: boolean;
  isFocused: boolean;
  highlightColor: string;
  onOpenNote: (noteId?: string) => void;
};

/** Hoisted function — Hermes TDZ breaks const components used above their binding. */
function NoteTitleRow({
  node,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
}: NoteTitleRowProps) {
  const emphasized = isCurrent || isFocused;

  return (
    <Pressable
      onPress={() => onOpenNote(node.noteId)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: ROW_GAP,
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 4,
        borderRadius: 8,
        borderWidth: HAIRLINE,
        borderColor: emphasized ? highlightColor : "transparent",
        backgroundColor: emphasized ? highlightColor : "transparent",
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open note ${node.title || node.name || ""}`}
    >
      <IconColumn>
        <Icon name="notebook-text" color="muted-foreground" size={ICON_SLOT} />
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
    </Pressable>
  );
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

function ThoughtTitleRow({
  node,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
  compactBottom = false,
}: ThoughtTitleRowProps) {
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
}

function ThoughtSummary({ summary }: { summary: string }) {
  return (
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
}

/**
 * Children list under a parent row.
 * `guideWidth` is the rail column — use CHEVRON_SLOT under folders so the
 * line centers on the chevron, ICON_SLOT under the layer root icon.
 */
const NestedChildren = ({
  nodes,
  ctx,
  guideWidth,
}: {
  nodes: NodeDatum[];
  ctx: TreeCtx;
  guideWidth: number;
}) => (
  <View>
    {nodes.map((node, index) => (
      <TreeBranch
        key={node.id}
        node={node}
        isLast={index === nodes.length - 1}
        ctx={ctx}
        guideWidth={guideWidth}
      />
    ))}
  </View>
);

const LeafBranch = ({
  isLast,
  ctx,
  guideWidth,
  header,
  nested,
}: {
  isLast: boolean;
  ctx: TreeCtx;
  guideWidth: number;
  header: React.ReactNode;
  nested?: React.ReactNode;
}) => (
  <View>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: guideWidth, alignSelf: "stretch" }}>
        <RailSegment
          lineColor={ctx.lineColor}
          top={0}
          bottom={isLast ? "50%" : 0}
          guideWidth={guideWidth}
        />
        <Elbow lineColor={ctx.lineColor} guideWidth={guideWidth} />
      </View>
      <View className="flex-1 min-w-0" style={{ marginLeft: ELBOW_WIDTH }}>
        {header}
      </View>
    </View>
    <View style={{ flexDirection: "row" }}>
      <View style={{ width: guideWidth, alignSelf: "stretch" }}>
        {!isLast ? (
          <RailSegment
            lineColor={ctx.lineColor}
            top={0}
            bottom={0}
            guideWidth={guideWidth}
          />
        ) : null}
      </View>
      <View
        className="flex-1 min-w-0"
        style={{
          marginLeft: ELBOW_WIDTH,
          paddingBottom: THOUGHT_BLOCK_GAP,
        }}
      >
        {nested}
      </View>
    </View>
  </View>
);

const TreeBranch = ({
  node,
  isLast,
  ctx,
  guideWidth,
}: {
  node: NodeDatum;
  isLast: boolean;
  ctx: TreeCtx;
  guideWidth: number;
}) => {
  if (isNoteLeaf(node)) {
    const isCurrent =
      node.id === ctx.currentNodeId ||
      (!!node.noteId &&
        (ctx.currentNodeId === node.noteId ||
          ctx.currentNodeId === `note-${node.noteId}`));
    const isFocused =
      !!ctx.focusedThoughtId &&
      (ctx.focusedThoughtId === node.noteId ||
        ctx.focusedThoughtId === node.id ||
        ctx.focusedThoughtId === `note-${node.noteId}`);

    return (
      <LeafBranch
        isLast={isLast}
        ctx={ctx}
        guideWidth={guideWidth}
        header={
          <NoteTitleRow
            node={node}
            isCurrent={isCurrent}
            isFocused={isFocused}
            highlightColor={ctx.highlightColor}
            onOpenNote={ctx.onOpenNote}
          />
        }
      />
    );
  }

  if (isThoughtLeaf(node)) {
    const isCurrent = node.id === ctx.currentNodeId;
    const isFocused = ctx.focusedThoughtId === node.thoughtId;
    const hasSummary = !!node.summary;

    return (
      <LeafBranch
        isLast={isLast}
        ctx={ctx}
        guideWidth={guideWidth}
        header={
          <ThoughtTitleRow
            node={node}
            isCurrent={isCurrent}
            isFocused={isFocused}
            highlightColor={ctx.highlightColor}
            onOpenNote={ctx.onOpenNote}
            compactBottom={hasSummary}
          />
        }
        nested={
          hasSummary ? <ThoughtSummary summary={node.summary!} /> : undefined
        }
      />
    );
  }

  return (
    <FolderBranch
      node={node}
      isLast={isLast}
      ctx={ctx}
      guideWidth={guideWidth}
    />
  );
};

const FolderBranch = ({
  node,
  isLast,
  ctx,
  guideWidth,
}: {
  node: NodeDatum;
  isLast: boolean;
  ctx: TreeCtx;
  guideWidth: number;
}) => {
  const children = node.children ?? [];
  const isCurrent = node.id === ctx.currentNodeId;
  const containsCurrent = useMemo(
    () =>
      containsNode(node, ctx.currentNodeId) ||
      (!!ctx.focusedThoughtId && containsNode(node, ctx.focusedThoughtId)),
    [node, ctx.currentNodeId, ctx.focusedThoughtId]
  );

  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (containsCurrent) setExpanded(true);
  }, [containsCurrent, ctx.currentNodeId, ctx.focusedThoughtId]);

  const canCollapse = children.length > 0;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: guideWidth, alignSelf: "stretch" }}>
          <RailSegment
            lineColor={ctx.lineColor}
            top={0}
            bottom={isLast ? "50%" : 0}
            guideWidth={guideWidth}
          />
          <Elbow lineColor={ctx.lineColor} guideWidth={guideWidth} />
        </View>
        <View className="flex-1 min-w-0" style={{ marginLeft: ELBOW_WIDTH }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ROW_GAP,
              paddingVertical: 6,
              paddingRight: 4,
              borderRadius: 8,
              borderWidth: HAIRLINE,
              borderColor: isCurrent ? ctx.highlightColor : "transparent",
              backgroundColor: isCurrent ? ctx.highlightColor : "transparent",
            }}
          >
            {canCollapse ? (
              <Pressable
                onPress={() => setExpanded((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  expanded ? "Collapse folder" : "Expand folder"
                }
                style={{
                  width: CHEVRON_SLOT,
                  height: CHEVRON_SLOT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name={expanded ? "chevron-down" : "chevron-right"}
                  color="muted-foreground"
                  size={14}
                />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => ctx.onNavigate(node.id)}
              style={{
                flex: 1,
                minWidth: 0,
                flexDirection: "row",
                alignItems: "center",
                gap: ROW_GAP,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Zoom to ${node.name || "group"}`}
            >
              <IconColumn>
                <NodeKindIcon node={node} graphMode={ctx.graphMode} />
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
                  <Icon
                    name="map-pin-simple"
                    color="muted-foreground"
                    size={12}
                  />
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>

      {canCollapse ? (
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: guideWidth, alignSelf: "stretch" }}>
            {!isLast ? (
              <RailSegment
                lineColor={ctx.lineColor}
                top={0}
                bottom={0}
                guideWidth={guideWidth}
              />
            ) : null}
          </View>
          <View
            className="flex-1 min-w-0"
            style={{
              // Align child rails with this folder's chevron column.
              marginLeft: ELBOW_WIDTH + HAIRLINE,
            }}
          >
            <CollapsibleContainer expanded={expanded}>
              <NestedChildren
                nodes={children}
                ctx={ctx}
                guideWidth={CHEVRON_SLOT}
              />
            </CollapsibleContainer>
          </View>
        </View>
      ) : null}
    </View>
  );
};

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
                nodes={children}
                guideWidth={ICON_SLOT}
                ctx={{
                  currentNodeId,
                  focusedThoughtId,
                  highlightColor,
                  lineColor,
                  graphMode,
                  onNavigate: navigateToNode,
                  onOpenNote: navigateToNote,
                }}
              />
            </View>
          ) : isNoteLeaf(layerRoot) ? (
            <View
              style={{
                marginLeft: HEADER_INSET + HAIRLINE,
                marginTop: 8,
              }}
            >
              <NoteTitleRow
                node={layerRoot}
                isCurrent={false}
                isFocused={
                  focusedThoughtId === layerRoot.noteId ||
                  focusedThoughtId === layerRoot.id
                }
                highlightColor={highlightColor}
                onOpenNote={navigateToNote}
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
