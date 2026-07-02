import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { NodeDatum } from "@/features/graph/types/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";
import {
  resolveListItemCategoryShade,
  resolveNodeCategoryKey,
} from "../../utils/resolveNodeCategoryKey";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import capitalize from "@/utils/stringManipulations/capitalize";

const MAX_CARD_TITLE_LENGTH = 20;
const MAX_THOUGHT_TITLE_LENGTH = 35;

const formatDisplayTitle = (
  value: string,
  maxLength = MAX_CARD_TITLE_LENGTH
) => {
  const title = capitalize(value || "");
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength)}…`;
};

const formatThoughtTitle = (value: string) =>
  formatDisplayTitle(value, MAX_THOUGHT_TITLE_LENGTH);
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { useGraphStore } from "../../context/graphContext";
import { GraphMode } from "../../types/types";

type ThoughtItemProps = {
  thought: NodeDatum & { idx: number };
  parentNodeId?: string;
  isHighlighted: boolean;
};

const isThoughtLeaf = (node: NodeDatum) => !!node.thoughtId;

const hasThoughtChildren = (node: NodeDatum) =>
  !!node.children?.length &&
  node.children.every((child) => isThoughtLeaf(child));

const hasGroupingChildren = (node: NodeDatum) =>
  !!node.children?.length &&
  node.children.some((child) => !isThoughtLeaf(child));

const resolveCategoryColor = (
  node: NodeDatum,
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"],
  shade?: number
) => {
  const categoryKey = resolveNodeCategoryKey(node);
  return categoryKey
    ? hsl(categoryKey, colorScheme, shade, "categories")
    : hsl("border", colorScheme);
};

const isCategoryGraphRoot = (graphMode: GraphMode, parentNodeId?: string) =>
  graphMode === "category" && parentNodeId === "root";

const resolveMainStripeColor = (
  thought: NodeDatum,
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"],
  parentNodeId?: string
) =>
  resolveCategoryColor(
    thought,
    colorScheme,
    resolveListItemCategoryShade(parentNodeId ?? "root")
  );

const resolveNestedStripeColor = (
  node: NodeDatum,
  colorScheme: ReturnType<typeof useColorScheme>["colorScheme"],
  useInputColor: boolean,
  shade?: number
) => {
  if (useInputColor) {
    return hsl("input", colorScheme);
  }

  return resolveCategoryColor(node, colorScheme, shade);
};

const NESTED_CATEGORY_SHADE = 50;

const isCategoryNode = (nodeId?: string | null) =>
  typeof nodeId === "string" && nodeId.startsWith("category-");

const isTopicNode = (nodeId?: string | null) =>
  typeof nodeId === "string" && nodeId.startsWith("topic-");

const showMainColorStripe = (
  parentNodeId: string | undefined,
  _thought: NodeDatum
) =>
  parentNodeId === "root" ||
  isTopicNode(parentNodeId) ||
  isCategoryNode(parentNodeId);

const showExpandedNestedStripe = (
  parentNodeId: string | undefined,
  expandedNode: NodeDatum,
  graphMode: GraphMode
) => {
  if (graphMode === "category") {
    return (
      isCategoryGraphRoot(graphMode, parentNodeId) &&
      isCategoryNode(expandedNode.id)
    );
  }

  return !isCategoryNode(parentNodeId) && !isCategoryNode(expandedNode.id);
};

const ColoredStripe = ({
  node,
  shade = NESTED_CATEGORY_SHADE,
  showColorStripe = true,
  useInputColor = false,
  children,
}: {
  node: NodeDatum;
  shade?: number;
  showColorStripe?: boolean;
  useInputColor?: boolean;
  children: React.ReactNode;
}) => {
  const { colorScheme } = useColorScheme();

  if (!showColorStripe) {
    return <View className="w-full">{children}</View>;
  }

  return (
    <View className="w-full flex-row">
      <View
        style={{
          backgroundColor: resolveNestedStripeColor(
            node,
            colorScheme,
            useInputColor,
            shade
          ),
          width: 2,
          borderRadius: 9999,
          alignSelf: "stretch",
        }}
      />
      <View className="flex-1 min-w-0 pl-2">{children}</View>
    </View>
  );
};

const THOUGHT_BULLET_SIZE = 6;
const THOUGHT_BULLET_GAP = 8;
const THOUGHT_BULLET_INDENT = THOUGHT_BULLET_SIZE + THOUGHT_BULLET_GAP;

const ThoughtBulletDot = ({ className }: { className?: string }) => {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className={cn("rounded-full mr-2 shrink-0", className)}
      style={{
        width: THOUGHT_BULLET_SIZE,
        height: THOUGHT_BULLET_SIZE,
        backgroundColor: hsl("border", colorScheme),
      }}
    />
  );
};

const ThoughtBulletTitleRow = ({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) => (
  <View className="flex-row items-center">
    <ThoughtBulletDot />
    <View className="flex-1 min-w-0">{children}</View>
    {trailing}
  </View>
);

const ThoughtBulletBody = ({ children }: { children: React.ReactNode }) => (
  <View style={{ paddingLeft: THOUGHT_BULLET_INDENT, marginTop: -2 }}>
    {children}
  </View>
);

const ThoughtContent = ({
  thought,
  showColorStripe = true,
  useInputColor = false,
}: {
  thought: NodeDatum;
  showColorStripe?: boolean;
  useInputColor?: boolean;
}) => {
  const { push } = useRouter();

  const navigateToNote = () => {
    if (!thought.noteId) return;
    push({
      pathname: "/notes/[id]",
      params: { id: thought.noteId },
    });
  };

  const content = (
    <View className="py-1">
      <ThoughtBulletTitleRow
        trailing={
          thought.noteId ? (
            <Button
              className="h-8 w-8 p-0"
              variant="ghost"
              size="icon"
              onPress={navigateToNote}
            >
              <Icon
                size={18}
                color="text"
                name="notebook-text"
                style={{ opacity: 0.8 }}
              />
            </Button>
          ) : null
        }
      >
        <Typography
          variant="h5"
          className="pb-0 leading-tight"
          style={{ includeFontPadding: false }}
        >
          {formatThoughtTitle(thought.title || thought.name || "")}
        </Typography>
      </ThoughtBulletTitleRow>
      {thought.summary ? (
        <ThoughtBulletBody>
          <Typography
            variant="p"
            className="pb-0 leading-snug"
            style={{ includeFontPadding: false }}
          >
            {thought.summary}
          </Typography>
        </ThoughtBulletBody>
      ) : null}
    </View>
  );

  if (!showColorStripe) return content;

  return (
    <ColoredStripe node={thought} useInputColor={useInputColor}>
      {content}
    </ColoredStripe>
  );
};

const ExpandedContent = ({
  thought,
  parentNodeId,
}: {
  thought: NodeDatum;
  parentNodeId?: string;
}) => {
  const { setParams } = useRouter();
  const graphMode = useGraphStore((state) => state.mode);
  const isCategoryRoot = isCategoryGraphRoot(graphMode, parentNodeId);
  const nestedColorStripe = showExpandedNestedStripe(
    parentNodeId,
    thought,
    graphMode
  );

  const navigateToGraphNode = (nodeId: string) => {
    setParams({
      id: nodeId,
      _t: Date.now().toString(),
    });
  };

  if (isThoughtLeaf(thought)) {
    return thought.summary ? (
      <Typography variant="p">{thought.summary}</Typography>
    ) : (
      <Typography variant="p" className="opacity-50">
        No content
      </Typography>
    );
  }

  if (hasThoughtChildren(thought)) {
    return (
      <View className="gap-4">
        {thought.children!.map((child) => (
          <ThoughtContent
            key={child.thoughtId ?? child.id}
            thought={child}
            showColorStripe={nestedColorStripe}
          />
        ))}
      </View>
    );
  }

  if (hasGroupingChildren(thought)) {
    return (
      <View className="gap-3">
        {thought.children!.map((group) => (
          <ColoredStripe
            key={group.id}
            node={group}
            showColorStripe={nestedColorStripe}
            useInputColor={isCategoryRoot}
          >
            <View className="gap-2 py-1 px-2">
              <View className="flex-row items-center gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onPress={() => navigateToGraphNode(group.id)}
                >
                  <Typography variant="muted">
                    {formatDisplayTitle(group.name || "", 35)}
                  </Typography>
                </Button>
              </View>

              {group.children?.length ? (
                <View className="gap-3">
                  {group.children.map((child) => (
                    <ThoughtContent
                      key={child.thoughtId ?? child.id}
                      thought={child}
                      showColorStripe={false}
                    />
                  ))}
                </View>
              ) : (
                <Typography variant="p" className="opacity-50">
                  No content
                </Typography>
              )}
            </View>
          </ColoredStripe>
        ))}
      </View>
    );
  }

  return (
    <Typography variant="p" className="opacity-50">
      No content
    </Typography>
  );
};

export const ThoughtItem: React.FC<ThoughtItemProps> = ({
  thought,
  parentNodeId,
  isHighlighted,
}) => {
  const { summary, name, children, noteId } = thought;
  const [expanded, setExpanded] = useState(isHighlighted);

  const { colorScheme } = useColorScheme();
  const { setParams, push } = useRouter();

  const handleZoom = () => {
    setParams({
      id: thought.id,
      _t: Date.now().toString(),
    });
  };

  const categoryColor = resolveMainStripeColor(
    thought,
    colorScheme,
    parentNodeId
  );

  const navigateToNote = () => {
    if (!noteId) return;
    push({
      pathname: "/notes/[id]",
      params: { id: noteId },
    });
  };

  const canExpand = hasThoughtChildren(thought) || hasGroupingChildren(thought);

  const mainColorStripe = showMainColorStripe(parentNodeId, thought);

  return (
    <Card className={cn("w-full overflow-hidden", isHighlighted && "border-2")}>
      <View className="w-full flex-row overflow-hidden">
        {mainColorStripe ? (
          <View
            style={{ backgroundColor: categoryColor }}
            className="w-3 self-stretch"
          />
        ) : null}
        <View className="flex-1 min-w-0 p-2">
          <View
            className={cn(
              "flex-row gap-2",
              noteId ? "items-start" : "items-center"
            )}
          >
            <View className="flex-1 min-w-0">
              {!isThoughtLeaf(thought) ? (
                <>
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={handleZoom}
                      className="flex-row items-center gap-2 shrink"
                    >
                      <Typography variant="h4" numberOfLines={1}>
                        {formatThoughtTitle(name || "")}
                      </Typography>
                      {children ? (
                        <Typography variant="p">({children.length})</Typography>
                      ) : null}
                    </Pressable>
                  </View>
                  {(!canExpand || !expanded) && summary ? (
                    <Typography variant="p" numberOfLines={2}>
                      {summary}
                    </Typography>
                  ) : null}
                </>
              ) : (
                <>
                  <View className="flex-row items-center gap-2">
                    <Typography
                      variant="h4"
                      numberOfLines={1}
                      padding
                      style={{ includeFontPadding: false }}
                    >
                      {formatThoughtTitle(name || "")}
                    </Typography>
                    {children ? (
                      <Typography variant="p">({children.length})</Typography>
                    ) : null}
                  </View>
                  {summary ? (
                    <Typography variant="p" numberOfLines={2}>
                      {summary}
                    </Typography>
                  ) : null}
                </>
              )}
            </View>
            <View
              className={cn(
                "flex-row shrink-0 gap-4",
                noteId ? "items-start" : "items-center"
              )}
            >
              {canExpand ? (
                <View className="mt-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="flex-row items-center gap-2 px-1 self-start"
                    onPress={() => setExpanded((prev) => !prev)}
                  >
                    <Icon
                      name={expanded ? "chevron-up" : "chevron-down"}
                      color="text"
                      style={{ marginTop: 4 }}
                      size={15}
                    />
                    <Typography style={{ fontSize: 10 }} variant="p">
                      {expanded ? "Less" : "More"}
                    </Typography>
                  </Button>
                </View>
              ) : null}
              {children ? (
                <Button
                  className="h-9 w-9 p-0"
                  variant="ghost"
                  size="icon"
                  onPress={handleZoom}
                >
                  <Icon
                    size={20}
                    color="text"
                    name="graph"
                    style={{ opacity: 0.8 }}
                  />
                </Button>
              ) : null}

              {noteId ? (
                <Button
                  className="h-9 w-9 p-0"
                  variant="ghost"
                  size="icon"
                  onPress={navigateToNote}
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
          </View>

          {canExpand ? (
            <>
              <CollapsibleContainer expanded={expanded}>
                <View className="gap-3 pt-2">
                  <ExpandedContent
                    thought={thought}
                    parentNodeId={parentNodeId}
                  />
                </View>
              </CollapsibleContainer>
            </>
          ) : null}
        </View>
      </View>
    </Card>
  );
};
