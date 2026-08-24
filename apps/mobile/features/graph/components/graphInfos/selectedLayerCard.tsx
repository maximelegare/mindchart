import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
import { onGraphBreadcrumbNavigate } from "@/features/navigation/syncLinkedBreadcrumbs";
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
import type { GraphMode, NodeDatum } from "../../types/types";
import type { Folder } from "@repo/zod-schemas/src/schemas";

const MAX_TITLE_LENGTH = 40;
const ICON_SLOT = 14;
const CHEVRON_SLOT = 22;
const BULLET_SIZE = 6;
const ROW_GAP = 6;
/** First-line box height — bullet + trailing actions align to this, not the full row. */
const TITLE_LINE_HEIGHT = 20;
const BODY_LINE_HEIGHT = 22;
/** Horizontal inset shared by the layer header and its child tree rail. */
const HEADER_INSET = 6;
/** Short horizontal run from the rail into the row — keep tight to free content width. */
const ELBOW_WIDTH = 4;
const LINE_WIDTH = Math.max(StyleSheet.hairlineWidth * 2, 1);
const HAIRLINE = StyleSheet.hairlineWidth;
/** Space between separate thoughts (not between a title and its summary). */
const THOUGHT_BLOCK_GAP = 14;
const TITLE_SUMMARY_GAP = 0;

/** Fixed row metrics for precomputing collapsible heights (avoid onLayout thrash). */
const EST_FOLDER_ROW = 36;
const EST_NOTE_LEAF = 46;
const EST_THOUGHT_TITLE = 30;
const EST_THOUGHT_TITLE_COMPACT = 26;
const EST_SUMMARY_LINE = 18;
const EST_SUMMARY_CHARS_PER_LINE = 42;
/** Prefetch children under a collapsed folder only when the list is small. */
const PREFETCH_MAX_CHILDREN = 48;

const formatTitle = (value: string, maxLength = MAX_TITLE_LENGTH) => {
  const title = capitalize(value || "");
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength)}…`;
};

/** Real title only — ignore empty / "Untitled" fallbacks from graph mappers. */
const resolveDisplayTitle = (node: NodeDatum): string | null => {
  const raw = (node.title ?? "").trim();
  if (!raw || raw.toLowerCase() === "untitled") return null;
  return raw;
};

const resolveDisplaySummary = (node: NodeDatum): string | null => {
  const summary = (node.summary ?? "").trim();
  return summary.length > 0 ? summary : null;
};

/** Map a graph leaf to the file-actions sheet payload. */
const noteFileFromNode = (node: NodeDatum): FolderTreeFile | null => {
  if (!node.noteId) return null;
  const title =
    resolveDisplayTitle(node) ??
    resolveDisplaySummary(node) ??
    (node.name || "").trim();
  return {
    id: node.noteId,
    title: title || "Untitled",
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
  onOpenNote,
}: {
  lineHeight: number;
  emphasized: boolean;
  noteId?: string;
  onOpenNote: (noteId?: string) => void;
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
        <Icon name="map-pin-simple" color="muted-foreground" size={12} />
      </View>
    ) : null}
    {noteId ? (
      <Pressable
        onPress={() => onOpenNote(noteId)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Open note"
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
      </Pressable>
    ) : null}
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

function estimateSummaryHeight(summary: string) {
  const lines = Math.max(
    1,
    Math.ceil(summary.length / EST_SUMMARY_CHARS_PER_LINE)
  );
  return lines * EST_SUMMARY_LINE + TITLE_SUMMARY_GAP;
}

/** Full on-screen height of a branch, respecting which folders are expanded. */
function estimateBranchHeight(
  node: NodeDatum,
  expandedIds: ReadonlySet<string>
): number {
  if (isNoteLeaf(node)) return EST_NOTE_LEAF;

  if (isThoughtLeaf(node)) {
    const hasTitle = !!resolveDisplayTitle(node);
    const summary = resolveDisplaySummary(node);
    if (!hasTitle && summary) {
      return (
        estimateSummaryHeight(summary) +
        EST_THOUGHT_TITLE_COMPACT +
        THOUGHT_BLOCK_GAP
      );
    }
    let height = summary ? EST_THOUGHT_TITLE_COMPACT : EST_THOUGHT_TITLE;
    if (summary) height += estimateSummaryHeight(summary);
    return height + THOUGHT_BLOCK_GAP;
  }

  let height = EST_FOLDER_ROW;
  if (expandedIds.has(node.id) && node.children?.length) {
    height += estimateNodesHeight(node.children, expandedIds);
  }
  return height;
}

/** Height of a NestedChildren list (collapsible content). */
function estimateNodesHeight(
  nodes: NodeDatum[],
  expandedIds: ReadonlySet<string>
): number {
  let height = 0;
  for (const node of nodes) {
    height += estimateBranchHeight(node, expandedIds);
  }
  return height;
}

type TreeCtx = {
  currentNodeId: string;
  focusedThoughtId?: string;
  /** Ids on the path to the current/focused node — O(1) highlight checks. */
  activePathIds: ReadonlySet<string>;
  /** User + path-driven folder expand state. */
  expandedIds: ReadonlySet<string>;
  toggleExpanded: (nodeId: string) => void;
  highlightColor: string;
  lineColor: string;
  graphMode: GraphMode;
  foldersById: ReadonlyMap<string, Folder>;
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
  const summary = resolveDisplaySummary(node);
  const label = title ?? summary ?? "";
  const lineHeight = title ? TITLE_LINE_HEIGHT : BODY_LINE_HEIGHT;

  const row = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
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
      accessibilityLabel={`Open note ${label}`}
    >
      <View
        className="items-center justify-center shrink-0"
        style={{ width: ICON_SLOT, height: lineHeight }}
      >
        <Icon name="notebook-text" color="muted-foreground" size={ICON_SLOT} />
      </View>
      {label ? (
        <Typography
          variant={title ? "h5" : "p"}
          className={cn(
            "flex-1 pb-0",
            title ? "leading-tight" : "leading-snug",
            emphasized && "font-semibold"
          )}
          style={{
            includeFontPadding: false,
            lineHeight,
          }}
          numberOfLines={title ? 2 : 3}
        >
          {title ? formatTitle(title) : label}
        </Typography>
      ) : null}
      {emphasized ? (
        <View
          style={{
            height: lineHeight,
            justifyContent: "center",
            opacity: 0.45,
          }}
        >
          <Icon name="map-pin-simple" color="muted-foreground" size={12} />
        </View>
      ) : null}
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
  /** When true, drop bottom padding so the summary sits tight under the title. */
  compactBottom?: boolean;
  /** Parent already wraps with NoteActionsWrap — avoid nested menus. */
  skipNoteActions?: boolean;
};

function ThoughtTitleRow({
  node,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
  compactBottom = false,
  skipNoteActions = false,
}: ThoughtTitleRowProps) {
  const { colorScheme } = useColorScheme();
  const bulletColor = hsl("muted-foreground", colorScheme);
  const emphasized = isCurrent || isFocused;
  const title = resolveDisplayTitle(node);

  const row = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
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
      <ThoughtBullet color={bulletColor} lineHeight={TITLE_LINE_HEIGHT} />
      {title ? (
        <Typography
          variant="h5"
          className={cn(
            "flex-1 pb-0 leading-tight",
            emphasized && "font-semibold"
          )}
          style={{
            includeFontPadding: false,
            lineHeight: TITLE_LINE_HEIGHT,
          }}
          numberOfLines={2}
        >
          {formatTitle(title)}
        </Typography>
      ) : (
        <View className="flex-1" style={{ height: TITLE_LINE_HEIGHT }} />
      )}
      <ThoughtRowActions
        lineHeight={TITLE_LINE_HEIGHT}
        emphasized={emphasized}
        noteId={node.noteId}
        onOpenNote={onOpenNote}
      />
    </View>
  );

  if (skipNoteActions) return row;
  return (
    <NoteActionsWrap node={node} onOpenNote={onOpenNote}>
      {row}
    </NoteActionsWrap>
  );
}

/** Title-less thought: content is the primary row (bullet + summary + open). */
function ThoughtContentRow({
  node,
  summary,
  isCurrent,
  isFocused,
  highlightColor,
  onOpenNote,
}: {
  node: NodeDatum;
  summary: string;
  isCurrent: boolean;
  isFocused: boolean;
  highlightColor: string;
  onOpenNote: (noteId?: string) => void;
}) {
  const { colorScheme } = useColorScheme();
  const bulletColor = hsl("muted-foreground", colorScheme);
  const emphasized = isCurrent || isFocused;

  return (
    <NoteActionsWrap node={node} onOpenNote={onOpenNote}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: ROW_GAP,
          paddingTop: 4,
          paddingBottom: 4,
          paddingRight: 4,
          borderRadius: 8,
          borderWidth: HAIRLINE,
          borderColor: emphasized ? highlightColor : "transparent",
          backgroundColor: emphasized ? highlightColor : "transparent",
        }}
      >
        <ThoughtBullet color={bulletColor} lineHeight={BODY_LINE_HEIGHT} />
        <Typography
          variant="p"
          className={cn(
            "flex-1 pb-0 leading-snug",
            emphasized && "font-semibold"
          )}
          style={{
            includeFontPadding: false,
            lineHeight: BODY_LINE_HEIGHT,
          }}
        >
          {summary}
        </Typography>
        <ThoughtRowActions
          lineHeight={BODY_LINE_HEIGHT}
          emphasized={emphasized}
          noteId={node.noteId}
          onOpenNote={onOpenNote}
        />
      </View>
    </NoteActionsWrap>
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

const LeafBranch = ({
  isLast,
  lineColor,
  guideWidth,
  header,
  nested,
}: {
  isLast: boolean;
  lineColor: string;
  guideWidth: number;
  header: React.ReactNode;
  nested?: React.ReactNode;
}) => (
  <View>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: guideWidth, alignSelf: "stretch" }}>
        <RailSegment
          lineColor={lineColor}
          top={0}
          bottom={isLast ? "50%" : 0}
          guideWidth={guideWidth}
        />
        <Elbow lineColor={lineColor} guideWidth={guideWidth} />
      </View>
      <View className="flex-1 min-w-0" style={{ marginLeft: ELBOW_WIDTH }}>
        {header}
      </View>
    </View>
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
          paddingBottom: THOUGHT_BLOCK_GAP,
        }}
      >
        {nested}
      </View>
    </View>
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
    const isCurrent = node.id === ctx.currentNodeId;
    const isFocused = ctx.focusedThoughtId === node.thoughtId;
    const title = resolveDisplayTitle(node);
    const summary = resolveDisplaySummary(node);

    // No title → content is the primary row (never show "Untitled").
    if (!title) {
      return (
        <LeafBranch
          isLast={isLast}
          lineColor={ctx.lineColor}
          guideWidth={guideWidth}
          header={
            summary ? (
              <ThoughtContentRow
                node={node}
                summary={summary}
                isCurrent={isCurrent}
                isFocused={isFocused}
                highlightColor={ctx.highlightColor}
                onOpenNote={ctx.onOpenNote}
              />
            ) : (
              <ThoughtTitleRow
                node={node}
                isCurrent={isCurrent}
                isFocused={isFocused}
                highlightColor={ctx.highlightColor}
                onOpenNote={ctx.onOpenNote}
              />
            )
          }
        />
      );
    }

    // Title + optional summary: one long-press target for the whole thought block.
    return (
      <LeafBranch
        isLast={isLast}
        lineColor={ctx.lineColor}
        guideWidth={guideWidth}
        header={
          <NoteActionsWrap node={node} onOpenNote={ctx.onOpenNote}>
            <View>
              <ThoughtTitleRow
                node={node}
                isCurrent={isCurrent}
                isFocused={isFocused}
                highlightColor={ctx.highlightColor}
                onOpenNote={ctx.onOpenNote}
                compactBottom={!!summary}
                skipNoteActions
              />
              {summary ? <ThoughtSummary summary={summary} /> : null}
            </View>
          </NoteActionsWrap>
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
      prefetchOnly={prefetchOnly}
    />
  );
});

const FolderBranch = React.memo(function FolderBranch({
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
  const children = node.children ?? [];
  const isCurrent = node.id === ctx.currentNodeId;
  const expanded = ctx.expandedIds.has(node.id);
  const canCollapse = children.length > 0;
  // Open parent: render the collapsible shell. Prefetch one closed layer when small.
  // Prefetch-only rows (under a collapsed parent): folder header only — no deeper mount.
  const showCollapsible = canCollapse && !prefetchOnly;
  const mountChildRows =
    showCollapsible && (expanded || children.length <= PREFETCH_MAX_CHILDREN);

  const contentHeight = useMemo(
    () =>
      showCollapsible ? estimateNodesHeight(children, ctx.expandedIds) : 0,
    [children, ctx.expandedIds, showCollapsible]
  );

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
                  accessibilityLabel={`Zoom to ${node.name || "group"}`}
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
            <CollapsibleContainer
              expanded={expanded}
              contentHeight={contentHeight}
            >
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

  const activePathIds = useMemo(
    () => buildActivePathIds(layerRoot, currentNodeId, focusedThoughtId),
    [layerRoot, currentNodeId, focusedThoughtId]
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(activePathIds)
  );
  const layerIdRef = useRef(layerRoot.id);
  const selectionKeyRef = useRef(`${currentNodeId}:${focusedThoughtId ?? ""}`);

  // Auto-expand the path only when the layer or selection changes — not on every
  // activePathIds rebuild (layerRoot churn), so the user can collapse a selected folder.
  useEffect(() => {
    const selectionKey = `${currentNodeId}:${focusedThoughtId ?? ""}`;
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
  }, [activePathIds, currentNodeId, focusedThoughtId, layerRoot.id]);

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
      setParams({
        id: nodeId,
        _t: Date.now().toString(),
      });
      onGraphBreadcrumbNavigate(nodeId);
    },
    [setParams]
  );

  const navigateHome = useCallback(() => {
    useGraphStore.setState({
      selectedFolderId: null,
      selectedCategoryId: null,
    });
    setParams({
      id: "root",
      _t: Date.now().toString(),
    });
    onGraphBreadcrumbNavigate("root");
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
      currentNodeId,
      focusedThoughtId,
      activePathIds,
      expandedIds,
      toggleExpanded,
      highlightColor,
      lineColor,
      graphMode,
      foldersById,
      onNavigate: navigateToNode,
      onOpenNote: navigateToNote,
    }),
    [
      activePathIds,
      currentNodeId,
      expandedIds,
      focusedThoughtId,
      foldersById,
      graphMode,
      highlightColor,
      lineColor,
      navigateToNode,
      navigateToNote,
      toggleExpanded,
    ]
  );

  const isLayerCurrent = layerRoot.id === currentNodeId;
  const children = layerRoot.children ?? [];

  const cardRadius = 18;

  return (
    <Card
      className="w-full overflow-hidden rounded-2xl border-0"
      style={{ borderRadius: cardRadius, overflow: "hidden", borderWidth: 0 }}
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
          <View style={{ alignSelf: "flex-start" }} className="mb-2">
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
              backgroundColor: isLayerCurrent ? highlightColor : "transparent",
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
                  focusedThoughtId === layerRoot.noteId ||
                  focusedThoughtId === layerRoot.id
                }
                highlightColor={highlightColor}
                onOpenNote={navigateToNote}
              />
            </View>
          ) : resolveDisplaySummary(layerRoot) || isThoughtLeaf(layerRoot) ? (
            <View
              style={{
                marginLeft: HEADER_INSET + HAIRLINE,
                marginTop: 8,
              }}
            >
              {isThoughtLeaf(layerRoot) ? (
                (() => {
                  const title = resolveDisplayTitle(layerRoot);
                  const summary = resolveDisplaySummary(layerRoot);
                  if (!title && summary) {
                    return (
                      <ThoughtContentRow
                        node={layerRoot}
                        summary={summary}
                        isCurrent={false}
                        isFocused={focusedThoughtId === layerRoot.thoughtId}
                        highlightColor={highlightColor}
                        onOpenNote={navigateToNote}
                      />
                    );
                  }
                  return (
                    <NoteActionsWrap
                      node={layerRoot}
                      onOpenNote={navigateToNote}
                    >
                      <View>
                        <ThoughtTitleRow
                          node={layerRoot}
                          isCurrent={false}
                          isFocused={focusedThoughtId === layerRoot.thoughtId}
                          highlightColor={highlightColor}
                          onOpenNote={navigateToNote}
                          skipNoteActions
                        />
                        {summary ? <ThoughtSummary summary={summary} /> : null}
                      </View>
                    </NoteActionsWrap>
                  );
                })()
              ) : (
                <Typography variant="p">
                  {resolveDisplaySummary(layerRoot)}
                </Typography>
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
