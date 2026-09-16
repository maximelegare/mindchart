import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/cn";
import { hsl, hslColor } from "@/utils/hsl";
import {
  DEFAULT_CATEGORY_COLOR,
  useCategoryColorMap,
} from "@/features/categories/hooks/useCategoryColor";
import capitalize from "@/utils/stringManipulations/capitalize";
import { FolderActionsMenu } from "@/features/contentList/features/folderContents/components/folderActionsMenu";
import { FileActionsMenu } from "@/features/contentList/components/folderTree/fileActionsMenu";
import type { FolderTreeFile } from "@/features/contentList/components/folderTree/folderTreeUtils";
import { useControllers } from "@/api/controllers/useControllers";
import { useGraphStore } from "../../context/graphContext";
import { isRealFolderNode } from "../../utils/buildGraphByFolder";
import {
  resolveListItemCategoryShade,
  resolveNodeCategoryKey,
} from "../../utils/resolveNodeCategoryKey";
import { navigateGraphSelection } from "../../utils/focusGraphNode";
import {
  collectNoteIdsFromNode,
  resolveDirectoryNode,
} from "../../utils/collectNoteIdsFromNode";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";
import type { GraphMode, NodeDatum } from "../../types/types";
import type { Folder } from "@repo/zod-schemas";
import { GraphInfosViewToggle } from "./graphInfosViewToggle";
import type { GraphInfosContentView } from "./graphInfosViewToggle";
import { GraphInfosNotesList } from "./graphInfosNotesList";

const MAX_TITLE_LENGTH = 40;
const ICON_SLOT = 14;
const CHEVRON_SLOT = 22;
const BULLET_SIZE = 6;
const ROW_GAP = 6;
/** First-line box height — bullet + trailing actions align to this, not the full row. */
const TITLE_LINE_HEIGHT = 20;
/** Thought first-line paddingTop + half the bullet box — elbow meets the bullet. */
const FIRST_LINE_CENTER = 4 + TITLE_LINE_HEIGHT / 2;
/** Summary body line height under a thought title. */
const EST_SUMMARY_LINE = 18;
/** Horizontal inset shared by the layer header and its child tree rail. */
const HEADER_INSET = 6;
/** Short horizontal run from the rail into the row — keep tight to free content width. */
const ELBOW_WIDTH = 4;
const LINE_WIDTH = Math.max(StyleSheet.hairlineWidth * 2, 1);
const HAIRLINE = StyleSheet.hairlineWidth;
/** Space between separate thoughts (not between a title and its summary). */
const THOUGHT_BLOCK_GAP = 14;

const formatTitle = (value: string, maxLength = MAX_TITLE_LENGTH) => {
  const title = capitalize(value || "");
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength)}…`;
};

/** Note/thought title for the infos list — never fall back to summary. */
const resolveDisplayTitle = (node: NodeDatum): string => {
  const raw = (node.title ?? node.name ?? "").trim();
  return raw || "Untitled";
};

const resolveDisplaySummary = (node: NodeDatum): string | null => {
  const summary = (node.summary ?? "").trim();
  return summary.length > 0 ? summary : null;
};

/** Map a graph leaf to the file-actions sheet payload. */
const noteFileFromNode = (node: NodeDatum): FolderTreeFile | null => {
  if (!node.noteId) return null;
  return {
    id: node.noteId,
    title: resolveDisplayTitle(node),
    folderId:
      node.folderId && node.folderId !== "unfiled" ? node.folderId : null,
  };
};

const isThoughtLeaf = (node: NodeDatum) => !!node.thoughtId;

/** Folder-mode leaves: note id without thoughtId. */
const isNoteLeaf = (node: NodeDatum) => !!node.noteId && !node.thoughtId;

const isFolderNode = (node: NodeDatum) =>
  !isNoteLeaf(node) && (!!node.folderId || node.id.startsWith("folder-"));

const isCategoryNode = (node: NodeDatum) => node.id.startsWith("category-");

const resolveGraphNodeLabel = (
  node: NodeDatum,
  categoryLabels: Map<string, string>
): string => {
  if (isCategoryNode(node) && node.name) {
    return categoryLabels.get(node.name) ?? node.name;
  }
  return node.name || node.title || "";
};

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

/** Bullet centered on the first text line (not the taller open-note button). */
const ThoughtBullet = ({
  color,
  lineHeight,
}: {
  color: string;
  lineHeight: number;
}) => (
  <View
    className="items-center justify-center shrink-0"
    style={{ width: ICON_SLOT, height: lineHeight }}
  >
    <View
      className="rounded-full"
      style={{
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        backgroundColor: color,
      }}
    />
  </View>
);

/**
 * Open-note (+ pin) chrome — same first-line box as the bullet so the glyph
 * lines up with title *or* body text (a fixed h-8 button only matched titles).
 */
const ThoughtRowActions = ({
  lineHeight,
  emphasized,
  noteId,
}: {
  lineHeight: number;
  emphasized: boolean;
  noteId?: string;
}) => (
  <View
    style={{
      height: lineHeight,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
    }}
  >
    {emphasized ? (
      <View style={{ opacity: 0.45 }}>
        <Icon name="map-pin-simple" color="text" size={12} />
      </View>
    ) : null}
    {noteId ? (
      <View
        style={{
          height: lineHeight,
          width: lineHeight + 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          size={16}
          color="text"
          name="notebook-text"
          style={{ opacity: 0.8 }}
        />
      </View>
    ) : null}
  </View>
);

const RailSegment = ({
  lineColor,
  top,
  bottom,
  height,
  guideWidth,
}: {
  lineColor: string;
  top: number | `${number}%`;
  bottom?: number | `${number}%`;
  height?: number;
  guideWidth: number;
}) => (
  <View
    style={{
      position: "absolute",
      left: guideWidth / 2 - LINE_WIDTH / 2,
      top,
      ...(height != null ? { height } : { bottom: bottom ?? 0 }),
      width: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const Elbow = ({
  lineColor,
  guideWidth,
  top = "50%",
}: {
  lineColor: string;
  guideWidth: number;
  top?: number | `${number}%`;
}) => (
  <View
    style={{
      position: "absolute",
      left: guideWidth / 2 - LINE_WIDTH / 2,
      top,
      marginTop: -LINE_WIDTH / 2,
      width: guideWidth / 2 + ELBOW_WIDTH,
      height: LINE_WIDTH,
      backgroundColor: lineColor,
    }}
  />
);

const nodeMatchesTarget = (node: NodeDatum, targetId: string): boolean =>
  node.id === targetId ||
  node.thoughtId === targetId ||
  node.noteId === targetId ||
  node.id === `note-${targetId}` ||
  !!node.relatedThoughtIds?.includes(targetId);

/** Ancestor ids from `root` down to `targetId` (inclusive). Null if not found. */
const collectAncestorIds = (
  root: NodeDatum,
  targetId: string
): Set<string> | null => {
  if (nodeMatchesTarget(root, targetId)) return new Set([root.id]);
  for (const child of root.children ?? []) {
    const found = collectAncestorIds(child, targetId);
    if (found) {
      found.add(root.id);
      return found;
    }
  }
  return null;
};

const buildActivePathIds = (
  root: NodeDatum,
  currentNodeId: string,
  focusedThoughtId?: string
): ReadonlySet<string> => {
  const ids = new Set<string>();
  collectAncestorIds(root, currentNodeId)?.forEach((id) => ids.add(id));
  if (focusedThoughtId) {
    collectAncestorIds(root, focusedThoughtId)?.forEach((id) => ids.add(id));
  }
  return ids;
};

type TreeCtx = {
  toggleExpanded: (nodeId: string) => void;
  highlightColor: string;
  lineColor: string;
  graphMode: GraphMode;
  foldersById: ReadonlyMap<string, Folder>;
  categoryLabels: Map<string, string>;
  onNavigate: (nodeId: string) => void;
  onOpenNote: (noteId?: string) => void;
};

type TreeSelectionState = {
  currentNodeId: string;
  focusedThoughtId?: string;
  expandedIds: ReadonlySet<string>;
  /** Folder ids that have the focused thought/note as a descendant. */
  idsWithFocusedChild: ReadonlySet<string>;
  expandEpoch: number;
};

type TreeSelectionStore = {
  getState: () => TreeSelectionState;
  subscribe: (listener: () => void) => () => void;
  replace: (next: Omit<TreeSelectionState, "expandEpoch">) => void;
  notify: () => void;
};

const EMPTY_ID_SET: ReadonlySet<string> = new Set();

const TreeSelectionStoreContext =
  React.createContext<TreeSelectionStore | null>(null);

function createTreeSelectionStore(
  initial: Omit<TreeSelectionState, "expandEpoch">
): TreeSelectionStore {
  let state: TreeSelectionState = { ...initial, expandEpoch: 0 };
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    replace: (next) => {
      const expandedChanged = next.expandedIds !== state.expandedIds;
      state = {
        ...next,
        expandEpoch: expandedChanged
          ? state.expandEpoch + 1
          : state.expandEpoch,
      };
    },
    notify: () => {
      listeners.forEach((listener) => listener());
    },
  };
}

function idsWithFocusedChildOf(
  root: NodeDatum,
  focusedThoughtId?: string
): ReadonlySet<string> {
  if (!focusedThoughtId) return EMPTY_ID_SET;
  const path = collectAncestorIds(root, focusedThoughtId);
  if (!path) return EMPTY_ID_SET;
  const ids = new Set(path);
  ids.delete(focusedThoughtId);
  ids.delete(`note-${focusedThoughtId}`);
  return ids;
}

function folderRowSnapshot(state: TreeSelectionState, nodeId: string) {
  const isCurrent =
    nodeId === state.currentNodeId && !state.idsWithFocusedChild.has(nodeId);
  return `${isCurrent ? 1 : 0}:${state.expandedIds.has(nodeId) ? 1 : 0}:${state.expandEpoch}`;
}

function leafRowSnapshot(
  state: TreeSelectionState,
  node: NodeDatum,
  kind: "note" | "thought"
) {
  const isCurrent =
    kind === "note"
      ? node.id === state.currentNodeId ||
        (!!node.noteId &&
          (state.currentNodeId === node.noteId ||
            state.currentNodeId === `note-${node.noteId}`))
      : node.id === state.currentNodeId;
  const isFocused =
    kind === "note"
      ? !!state.focusedThoughtId &&
        (state.focusedThoughtId === node.noteId ||
          state.focusedThoughtId === node.id ||
          state.focusedThoughtId === `note-${node.noteId}`)
      : state.focusedThoughtId === node.thoughtId;
  return `${isCurrent ? 1 : 0}:${isFocused ? 1 : 0}`;
}

function useTreeSelectionStore() {
  const store = useContext(TreeSelectionStoreContext);
  if (!store) {
    throw new Error("TreeSelectionStoreContext is missing");
  }
  return store;
}

type NoteTitleRowProps = {
  node: NodeDatum;
  isCurrent: boolean;
  isFocused: boolean;
  highlightColor: string;
  onOpenNote: (noteId?: string) => void;
};

/** Long-press → note options sheet (same as folder tree files). */
function NoteActionsWrap({
  node,
  onOpenNote,
  children,
}: {
  node: NodeDatum;
  onOpenNote: (noteId?: string) => void;
  children: React.ReactNode;
}) {
  const file = noteFileFromNode(node);
  if (!file) return <>{children}</>;
  return (
    <FileActionsMenu
      file={file}
      onNavigate={() => onOpenNote(node.noteId)}
      className="flex-1 min-w-0"
      hitSlop={0}
    >
      {children}
    </FileActionsMenu>
  );
}

/** Hoisted function — Hermes TDZ breaks const components used above their binding. */
function NoteTitleRow({
  node,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
}: NoteTitleRowProps) {
  const emphasized = isCurrent || isFocused;
  const title = resolveDisplayTitle(node);
  const lineHeight = TITLE_LINE_HEIGHT;

  const row = (
    <View
      style={{
        paddingBottom: 0,
        borderRadius: 8,
        borderWidth: HAIRLINE,
        borderColor: emphasized ? highlightColor : "transparent",
        backgroundColor: emphasized ? highlightColor : "transparent",
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open note ${title}`}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: ROW_GAP,
          paddingTop: 4,
          paddingBottom: 4,
          paddingRight: 4,
        }}
      >
        <View
          className="items-center justify-center shrink-0"
          style={{ width: ICON_SLOT, height: lineHeight }}
        >
          <Icon
            name="notebook-text"
            color="muted-foreground"
            size={ICON_SLOT}
          />
        </View>
        <Typography
          variant="h5"
          className={cn(
            "flex-1 pb-0 leading-tight",
            emphasized && "font-semibold"
          )}
          style={{
            includeFontPadding: false,
            lineHeight,
          }}
          numberOfLines={2}
        >
          {formatTitle(title)}
        </Typography>
        {emphasized ? (
          <View
            style={{
              height: lineHeight,
              justifyContent: "center",
              opacity: 0.45,
            }}
          >
            <Icon name="map-pin-simple" color="text" size={12} />
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <NoteActionsWrap node={node} onOpenNote={onOpenNote}>
      {row}
    </NoteActionsWrap>
  );
}

type ThoughtTitleRowProps = {
  node: NodeDatum;
  isCurrent: boolean;
  isFocused: boolean;
  highlightColor: string;
  onOpenNote: (noteId?: string) => void;
};

function ThoughtFirstLine({
  text,
  variant,
  emphasized,
  noteId,
  compactBottom,
}: {
  text: string;
  variant: "title" | "summary";
  emphasized: boolean;
  noteId?: string;
  compactBottom: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const bulletColor = hsl("muted-foreground", colorScheme);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: ROW_GAP,
        paddingTop: 4,
        paddingBottom: compactBottom ? 0 : 4,
        paddingRight: 4,
      }}
    >
      <ThoughtBullet color={bulletColor} lineHeight={TITLE_LINE_HEIGHT} />
      <Typography
        variant={variant === "title" ? "h5" : "p"}
        className={cn(
          "flex-1 pb-0 leading-tight",
          variant === "summary" && "opacity-90",
          emphasized && variant === "title" && "font-semibold"
        )}
        style={{
          includeFontPadding: false,
          lineHeight: TITLE_LINE_HEIGHT,
        }}
        numberOfLines={variant === "title" ? 2 : undefined}
      >
        {variant === "title" ? formatTitle(text) : text}
      </Typography>
      <ThoughtRowActions
        lineHeight={TITLE_LINE_HEIGHT}
        emphasized={emphasized}
        noteId={noteId}
      />
    </View>
  );
}

function ThoughtTitleRow({
  node,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
}: ThoughtTitleRowProps) {
  const emphasized = isCurrent || isFocused;
  const title = (node.title ?? "").trim();
  const hasTitle = title.length > 0;
  const summary = resolveDisplaySummary(node);

  const block = (
    <View
      style={{
        borderRadius: 8,
        borderWidth: HAIRLINE,
        borderColor: emphasized ? highlightColor : "transparent",
        backgroundColor: emphasized ? highlightColor : "transparent",
      }}
    >
      {hasTitle ? (
        <>
          <ThoughtFirstLine
            text={title}
            variant="title"
            emphasized={emphasized}
            noteId={node.noteId}
            compactBottom={!!summary}
          />
          {summary ? (
            <Typography
              variant="p"
              padding={false}
              className="opacity-80"
              style={{
                marginLeft: ICON_SLOT + ROW_GAP,
                marginRight: 4,
                paddingBottom: 4,
                includeFontPadding: false,
                lineHeight: EST_SUMMARY_LINE,
              }}
            >
              {summary}
            </Typography>
          ) : null}
        </>
      ) : (
        <ThoughtFirstLine
          text={summary ?? "Untitled"}
          variant={summary ? "summary" : "title"}
          emphasized={emphasized}
          noteId={node.noteId}
          compactBottom={false}
        />
      )}
    </View>
  );

  return (
    <NoteActionsWrap node={node} onOpenNote={onOpenNote}>
      {block}
    </NoteActionsWrap>
  );
}

const LeafBranch = ({
  isLast,
  lineColor,
  guideWidth,
  header,
  nested,
  elbowAlign = "center",
}: {
  isLast: boolean;
  lineColor: string;
  guideWidth: number;
  header: React.ReactNode;
  nested?: React.ReactNode;
  elbowAlign?: "center" | "firstLine";
}) => (
  <View>
    <View
      style={{
        flexDirection: "row",
        alignItems: elbowAlign === "firstLine" ? "flex-start" : "center",
      }}
    >
      <View style={{ width: guideWidth, alignSelf: "stretch" }}>
        <RailSegment
          lineColor={lineColor}
          top={0}
          bottom={
            isLast && elbowAlign !== "firstLine"
              ? "50%"
              : isLast
                ? undefined
                : 0
          }
          height={
            isLast && elbowAlign === "firstLine" ? FIRST_LINE_CENTER : undefined
          }
          guideWidth={guideWidth}
        />
        <Elbow
          lineColor={lineColor}
          guideWidth={guideWidth}
          top={elbowAlign === "firstLine" ? FIRST_LINE_CENTER : "50%"}
        />
      </View>
      <View className="flex-1 min-w-0" style={{ marginLeft: ELBOW_WIDTH }}>
        {header}
      </View>
    </View>
    {!isLast || nested ? (
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: guideWidth, alignSelf: "stretch" }}>
          {!isLast ? (
            <RailSegment
              lineColor={lineColor}
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
            paddingBottom: isLast ? 0 : THOUGHT_BLOCK_GAP,
          }}
        >
          {nested}
        </View>
      </View>
    ) : null}
  </View>
);

/**
 * Children under a parent row.
 * `prefetchOnly` — mounted under a collapsed parent: render rows, but do not
 * mount *their* children (one-layer prefetch beyond the open frontier).
 */
function NestedChildren({
  nodes,
  ctx,
  guideWidth,
  prefetchOnly = false,
}: {
  nodes: NodeDatum[];
  ctx: TreeCtx;
  guideWidth: number;
  prefetchOnly?: boolean;
}) {
  return (
    <View>
      {nodes.map((node, index) => (
        <TreeBranch
          key={node.id}
          node={node}
          isLast={index === nodes.length - 1}
          ctx={ctx}
          guideWidth={guideWidth}
          prefetchOnly={prefetchOnly}
        />
      ))}
    </View>
  );
}

const TreeBranch = React.memo(function TreeBranch({
  node,
  isLast,
  ctx,
  guideWidth,
  prefetchOnly = false,
}: {
  node: NodeDatum;
  isLast: boolean;
  ctx: TreeCtx;
  guideWidth: number;
  prefetchOnly?: boolean;
}) {
  const store = useTreeSelectionStore();
  const rowSnapshot = useSyncExternalStore(
    store.subscribe,
    () =>
      isNoteLeaf(node)
        ? leafRowSnapshot(store.getState(), node, "note")
        : isThoughtLeaf(node)
          ? leafRowSnapshot(store.getState(), node, "thought")
          : folderRowSnapshot(store.getState(), node.id),
    () =>
      isNoteLeaf(node)
        ? leafRowSnapshot(store.getState(), node, "note")
        : isThoughtLeaf(node)
          ? leafRowSnapshot(store.getState(), node, "thought")
          : folderRowSnapshot(store.getState(), node.id)
  );

  if (isNoteLeaf(node)) {
    const [currentBit, focusedBit] = rowSnapshot.split(":");
    const isCurrent = currentBit === "1";
    const isFocused = focusedBit === "1";

    return (
      <LeafBranch
        isLast={isLast}
        lineColor={ctx.lineColor}
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
    const [currentBit, focusedBit] = rowSnapshot.split(":");
    const isCurrent = currentBit === "1";
    const isFocused = focusedBit === "1";

    return (
      <LeafBranch
        isLast={isLast}
        lineColor={ctx.lineColor}
        guideWidth={guideWidth}
        elbowAlign="firstLine"
        header={
          <ThoughtTitleRow
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

  const [currentBit, expandedBit] = rowSnapshot.split(":");

  return (
    <FolderBranch
      node={node}
      isLast={isLast}
      ctx={ctx}
      guideWidth={guideWidth}
      prefetchOnly={prefetchOnly}
      isCurrent={currentBit === "1"}
      expanded={expandedBit === "1"}
    />
  );
});

const FolderBranch = React.memo(function FolderBranch({
  node,
  isLast,
  ctx,
  guideWidth,
  prefetchOnly = false,
  isCurrent,
  expanded,
}: {
  node: NodeDatum;
  isLast: boolean;
  ctx: TreeCtx;
  guideWidth: number;
  prefetchOnly?: boolean;
  isCurrent: boolean;
  expanded: boolean;
}) {
  const children = node.children ?? [];
  const canCollapse = children.length > 0;
  // Open parent: render the collapsible shell. Prefetch one closed layer when small.
  // Prefetch-only rows (under a collapsed parent): folder header only — no deeper mount.
  const showCollapsible = canCollapse && !prefetchOnly;
  const mountChildRows = showCollapsible && expanded;

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
                onPress={() => ctx.toggleExpanded(node.id)}
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
                  // Above FolderActionsMenu — its hitSlop steals chevron taps in folder mode.
                  zIndex: 2,
                }}
              >
                <Icon
                  name={expanded ? "chevron-down" : "chevron-right"}
                  color="muted-foreground"
                  size={14}
                />
              </Pressable>
            ) : null}
            {(() => {
              const folder =
                ctx.graphMode === "folder" &&
                isRealFolderNode(node) &&
                node.folderId
                  ? (ctx.foldersById.get(node.folderId) ?? null)
                  : null;

              const rowContent = (
                <>
                  <IconColumn>
                    <NodeKindIcon node={node} graphMode={ctx.graphMode} />
                  </IconColumn>
                  <Typography
                    variant="small"
                    className={cn("flex-1", isCurrent && "font-semibold")}
                    numberOfLines={1}
                  >
                    {formatTitle(
                      resolveGraphNodeLabel(node, ctx.categoryLabels),
                      35
                    )}
                  </Typography>
                  {children.length > 0 ? (
                    <Typography variant="p" className="text-xs opacity-60">
                      {children.length}
                    </Typography>
                  ) : null}
                  {isCurrent ? (
                    <View style={{ opacity: 0.45 }}>
                      <Icon name="map-pin-simple" color="text" size={12} />
                    </View>
                  ) : null}
                </>
              );

              if (folder) {
                return (
                  <FolderActionsMenu
                    target={{ kind: "folder", folder }}
                    onNavigate={() => ctx.onNavigate(node.id)}
                    className="flex-1 min-w-0"
                    hitSlop={0}
                  >
                    <View
                      style={{
                        flex: 1,
                        minWidth: 0,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: ROW_GAP,
                      }}
                    >
                      {rowContent}
                    </View>
                  </FolderActionsMenu>
                );
              }

              return (
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
                  accessibilityLabel={`Zoom to ${
                    resolveGraphNodeLabel(node, ctx.categoryLabels) || "group"
                  }`}
                >
                  {rowContent}
                </Pressable>
              );
            })()}
          </View>
        </View>
      </View>

      {showCollapsible ? (
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
            <CollapsibleContainer expanded={expanded} duration={0}>
              {mountChildRows ? (
                <NestedChildren
                  nodes={children}
                  ctx={ctx}
                  guideWidth={CHEVRON_SLOT}
                  prefetchOnly={!expanded}
                />
              ) : null}
            </CollapsibleContainer>
          </View>
        </View>
      ) : null}
    </View>
  );
});

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
  const categoryColorMap = useCategoryColorMap();
  const categoryLabels = useCategoryLabelsMap();
  const { setParams, push } = useRouter();
  const graphMode = useGraphStore((state) => state.mode);
  const highlightColor = hsl("border", colorScheme);
  const lineColor = hsl("border", colorScheme);
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery({
    enabled: graphMode === "folder",
  });
  const foldersById = useMemo(
    () => new Map(allFolders.map((folder) => [folder.id, folder])),
    [allFolders]
  );

  const categoryKey = resolveNodeCategoryKey(layerRoot);
  const showMainStripe = graphMode === "category";
  const stripeColor = categoryKey
    ? hslColor(
        categoryColorMap.get(categoryKey) ?? DEFAULT_CATEGORY_COLOR,
        resolveListItemCategoryShade("root")
      )
    : hsl("border", colorScheme);

  const contentFocusId =
    focusedThoughtId &&
    focusedThoughtId !== currentNodeId &&
    focusedThoughtId !== "root" &&
    !focusedThoughtId.startsWith("folder-") &&
    !focusedThoughtId.startsWith("category-")
      ? focusedThoughtId
      : undefined;

  const activePathIds = useMemo(
    () => buildActivePathIds(layerRoot, currentNodeId, contentFocusId),
    [layerRoot, currentNodeId, contentFocusId]
  );

  const idsWithFocusedChild = useMemo(
    () => idsWithFocusedChildOf(layerRoot, contentFocusId),
    [layerRoot, contentFocusId]
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(activePathIds)
  );
  const layerIdRef = useRef(layerRoot.id);
  const selectionKeyRef = useRef(`${currentNodeId}:${contentFocusId ?? ""}`);

  // Auto-expand the path only when the layer or selection changes — not on every
  // activePathIds rebuild (layerRoot churn), so the user can collapse a selected folder.
  useEffect(() => {
    const selectionKey = `${currentNodeId}:${contentFocusId ?? ""}`;
    const layerChanged = layerIdRef.current !== layerRoot.id;
    const selectionChanged = selectionKeyRef.current !== selectionKey;

    if (layerChanged) {
      layerIdRef.current = layerRoot.id;
      selectionKeyRef.current = selectionKey;
      setExpandedIds(new Set(activePathIds));
      return;
    }

    if (selectionChanged) {
      selectionKeyRef.current = selectionKey;
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const id of activePathIds) next.add(id);
        return next;
      });
    }
  }, [activePathIds, contentFocusId, currentNodeId, layerRoot.id]);

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const navigateToNode = useCallback(
    (nodeId: string) => {
      navigateGraphSelection(nodeId, setParams);
    },
    [setParams]
  );

  const navigateHome = useCallback(() => {
    const { selectedFolderId, selectedCategoryId } = useGraphStore.getState();
    if (selectedFolderId || selectedCategoryId) {
      useGraphStore.setState({
        selectedFolderId: null,
        selectedCategoryId: null,
      });
    }
    navigateGraphSelection("root", setParams);
  }, [setParams]);

  const navigateToNote = useCallback(
    (noteId?: string) => {
      if (!noteId) return;
      push({
        pathname: "/graph/note/[id]",
        params: { id: noteId },
      });
    },
    [push]
  );

  const treeCtx = useMemo<TreeCtx>(
    () => ({
      toggleExpanded,
      highlightColor,
      lineColor,
      graphMode,
      foldersById,
      categoryLabels,
      onNavigate: navigateToNode,
      onOpenNote: navigateToNote,
    }),
    [
      categoryLabels,
      foldersById,
      graphMode,
      highlightColor,
      lineColor,
      navigateToNode,
      navigateToNote,
      toggleExpanded,
    ]
  );

  const selectionStoreRef = useRef<TreeSelectionStore | null>(null);
  if (!selectionStoreRef.current) {
    selectionStoreRef.current = createTreeSelectionStore({
      currentNodeId,
      focusedThoughtId: contentFocusId,
      expandedIds,
      idsWithFocusedChild,
    });
  } else {
    const prev = selectionStoreRef.current.getState();
    if (
      prev.currentNodeId !== currentNodeId ||
      prev.focusedThoughtId !== contentFocusId ||
      prev.expandedIds !== expandedIds ||
      prev.idsWithFocusedChild !== idsWithFocusedChild
    ) {
      selectionStoreRef.current.replace({
        currentNodeId,
        focusedThoughtId: contentFocusId,
        expandedIds,
        idsWithFocusedChild,
      });
    }
  }

  useLayoutEffect(() => {
    selectionStoreRef.current?.notify();
  }, [contentFocusId, currentNodeId, expandedIds, idsWithFocusedChild]);

  const isLayerCurrent =
    layerRoot.id === currentNodeId && !idsWithFocusedChild.has(layerRoot.id);
  const children = layerRoot.children ?? [];
  const [contentView, setContentView] = useState<GraphInfosContentView>("tree");

  const swipeToView = useCallback((next: GraphInfosContentView) => {
    setContentView(next);
  }, []);

  const swipeBetweenViews = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-28, 28])
        .failOffsetY([-24, 24])
        .onEnd((event) => {
          "use worklet";
          const { translationX, velocityX } = event;
          if (Math.abs(translationX) < 48 && Math.abs(velocityX) < 500) {
            return;
          }
          const goingLeft =
            Math.abs(translationX) >= 48 ? translationX < 0 : velocityX < 0;
          runOnJS(swipeToView)(goingLeft ? "notes" : "tree");
        }),
    [swipeToView]
  );

  const directoryNode = useMemo(
    () => resolveDirectoryNode(layerRoot, currentNodeId),
    [currentNodeId, layerRoot]
  );

  const directoryNoteIds = useMemo(
    () => collectNoteIdsFromNode(directoryNode),
    [directoryNode]
  );

  const cardRadius = 18;

  return (
    <TreeSelectionStoreContext.Provider value={selectionStoreRef.current}>
      <GestureDetector gesture={swipeBetweenViews}>
        <Card
          className="w-full overflow-hidden rounded-2xl border-0"
          style={{
            borderRadius: cardRadius,
            overflow: "hidden",
            borderWidth: 0,
          }}
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

            <View className="flex-1 min-w-0 p-3.5">
              <View className="flex-row items-center justify-between mb-2">
                <Button
                  onPress={navigateHome}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Back to home"
                  variant="ghost"
                  size="sm"
                  className="flex-row items-center gap-2 p-0"
                >
                  <Icon name="arrow-left" color="muted-foreground" size={16} />
                  <View className="flex-row items-center gap-1">
                    <Icon name="house" color="muted-foreground" size={16} />
                    <Typography variant="p" className="opacity-70 pb-0">
                      Home
                    </Typography>
                  </View>
                </Button>
                <GraphInfosViewToggle
                  view={contentView}
                  onChange={setContentView}
                />
              </View>
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
                  backgroundColor: isLayerCurrent
                    ? highlightColor
                    : "transparent",
                }}
              >
                {(() => {
                  const layerFolder =
                    graphMode === "folder" &&
                    isRealFolderNode(layerRoot) &&
                    layerRoot.folderId
                      ? (foldersById.get(layerRoot.folderId) ?? null)
                      : null;

                  const layerRow = (
                    <>
                      <IconColumn>
                        <NodeKindIcon node={layerRoot} graphMode={graphMode} />
                      </IconColumn>
                      <Typography
                        variant="h4"
                        numberOfLines={1}
                        style={{ flex: 1 }}
                      >
                        {formatTitle(
                          layerRoot.folderLabel ||
                            resolveGraphNodeLabel(layerRoot, categoryLabels) ||
                            layerRoot.title ||
                            ""
                        )}
                      </Typography>
                      {children.length ? (
                        <Typography variant="p">({children.length})</Typography>
                      ) : null}
                      {isLayerCurrent ? (
                        <View style={{ opacity: 0.45 }}>
                          <Icon name="map-pin-simple" color="text" size={12} />
                        </View>
                      ) : null}
                    </>
                  );

                  if (layerFolder) {
                    return (
                      <FolderActionsMenu
                        target={{ kind: "folder", folder: layerFolder }}
                        onNavigate={() => navigateToNode(layerRoot.id)}
                        className="flex-1 min-w-0"
                        hitSlop={0}
                      >
                        <View
                          style={{
                            flex: 1,
                            minWidth: 0,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: ROW_GAP,
                          }}
                        >
                          {layerRow}
                        </View>
                      </FolderActionsMenu>
                    );
                  }

                  return (
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
                      {layerRow}
                    </Pressable>
                  );
                })()}
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

              {contentView === "notes" ? (
                <GraphInfosNotesList noteIds={directoryNoteIds} />
              ) : children.length ? (
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
                    ctx={treeCtx}
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
                      contentFocusId === layerRoot.noteId ||
                      contentFocusId === layerRoot.id
                    }
                    highlightColor={highlightColor}
                    onOpenNote={navigateToNote}
                  />
                </View>
              ) : isThoughtLeaf(layerRoot) ? (
                <View
                  style={{
                    marginLeft: HEADER_INSET + HAIRLINE,
                    marginTop: 8,
                  }}
                >
                  <ThoughtTitleRow
                    node={layerRoot}
                    isCurrent={false}
                    isFocused={contentFocusId === layerRoot.thoughtId}
                    highlightColor={highlightColor}
                    onOpenNote={navigateToNote}
                  />
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
      </GestureDetector>
    </TreeSelectionStoreContext.Provider>
  );
};
