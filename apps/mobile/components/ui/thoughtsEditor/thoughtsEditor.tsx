import { CategoryKey } from "@repo/sqlite";
import { Category } from "@repo/zod-schemas";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import React from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useFormContext } from "react-hook-form";
import { RichEditor } from "react-native-pell-rich-editor";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check } from "@/lib/icons/Check";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { createEmptyThought, type ThoughtsEditorFormValues } from "./types";
import {
  htmlToThoughts,
  setThoughtCategoryScript,
  thoughtsToHtml,
} from "./thoughtsHtml";
import {
  BULLET_EDITOR_GUARD_SCRIPT,
  REFRESH_CATEGORY_TIMERS_SCRIPT,
  setShowTitlesScript,
} from "./bulletEditorScript";

export type { ThoughtsFormValue, ThoughtsEditorFormValues } from "./types";
export { createEmptyThought } from "./types";

/** Keep the caret slightly above the editor's bottom edge. */
const CARET_BOTTOM_MARGIN = 28;

const REQUEST_CURSOR_OFFSET_SCRIPT = `
  (function () {
    var sel = window.getSelection();
    var node = sel && sel.anchorNode;
    if (!node) return true;
    var el = node.nodeType === 3 ? node.parentElement : node;
    var offsetY = 0;
    var siblingOffset =
      (el && el.nextSibling && el.nextSibling.offsetTop) ||
      (el && el.previousSibling && el.previousSibling.offsetTop) ||
      0;
    var rectOffset = 0;
    if (sel.rangeCount > 0) {
      var rect = sel.getRangeAt(0).getClientRects()[0];
      rectOffset = rect ? rect.y : 0;
    }
    while (el) {
      if (el.offsetTop) {
        offsetY = el.offsetTop;
        break;
      }
      el = el.parentElement;
    }
    offsetY = offsetY || siblingOffset || rectOffset;
    if (offsetY && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "OFFSET_Y", data: offsetY })
      );
    }
    return true;
  })();
`;

function buildCategoryColorCss(): string {
  return Object.entries(CATEGORIES_COLORS)
    .map(
      ([id, color]) => `
      li[data-category-id="${id}"] .thought-stripe {
        background-color: ${color};
      }
    `
    )
    .join("\n");
}

type CategoryListItemProps = {
  item: Category;
  onPress: () => void;
  selected: boolean;
};

function CategoryListItem({ item, onPress, selected }: CategoryListItemProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Pressable
      className="py-4 px-2 w-full rounded-lg border border-solid"
      style={{
        borderColor: selected ? hsl("border", colorScheme) : "transparent",
      }}
      onPress={onPress}
    >
      <View className="flex gap-2 items-center flex-row justify-between">
        <View
          className="w-4 h-4 rounded-full pr-4 pt-1"
          style={{ backgroundColor: CATEGORIES_COLORS[item.id as CategoryKey] }}
        />
        <View className="flex-1">
          <Typography>{item.name}</Typography>
        </View>
        <View>{selected && <Check className="text-accent-foreground" />}</View>
      </View>
    </Pressable>
  );
}

type ThoughtsEditorProps = {
  noteId: string;
  categories: Category[];
  defaultShowTitles?: boolean;
};

export function ThoughtsEditor({
  noteId,
  categories,
  defaultShowTitles = false,
}: ThoughtsEditorProps) {
  const { colorScheme } = useColorScheme();
  const { getValues, setValue, watch } =
    useFormContext<ThoughtsEditorFormValues>();
  const [showTitles, setShowTitles] = React.useState(defaultShowTitles);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [categoryPickerIndex, setCategoryPickerIndex] = React.useState<
    number | null
  >(null);

  const richRef = React.useRef<RichEditor>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollViewHeightRef = React.useRef(0);
  const lastCursorYRef = React.useRef(0);
  const keyboardOpenRef = React.useRef(false);
  const showTitlesRef = React.useRef(showTitles);
  showTitlesRef.current = showTitles;
  const initialHtmlRef = React.useRef(
    thoughtsToHtml(getValues("thoughts"), defaultShowTitles)
  );
  const categoryColorsCssRef = React.useRef(buildCategoryColorCss());
  const {
    ref: categorySheetRef,
    open: openCategorySheet,
    close: closeCategorySheet,
  } = useBottomSheet();

  const thoughts = watch("thoughts");
  const selectedCategoryId =
    categoryPickerIndex != null
      ? (thoughts?.[categoryPickerIndex]?.categoryId ?? "uncategorized")
      : null;

  const requestCursorOffset = React.useCallback(() => {
    richRef.current?.injectJavascript(REQUEST_CURSOR_OFFSET_SCRIPT);
  }, []);

  const scrollCursorIntoView = React.useCallback((cursorY: number) => {
    if (cursorY > 0) {
      lastCursorYRef.current = cursorY;
    }
    const viewportH = scrollViewHeightRef.current;
    const y = lastCursorYRef.current;
    if (viewportH <= 0 || y <= 0) return;

    const targetY = Math.max(0, y - (viewportH - CARET_BOTTOM_MARGIN));
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, []);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      keyboardOpenRef.current = true;
      setKeyboardOpen(true);

      const refresh = () => {
        scrollCursorIntoView(lastCursorYRef.current);
        requestCursorOffset();
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(refresh);
      });
      setTimeout(refresh, 120);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardOpenRef.current = false;
      setKeyboardOpen(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [requestCursorOffset, scrollCursorIntoView]);

  React.useEffect(() => {
    if (!keyboardOpen) return;
    scrollCursorIntoView(lastCursorYRef.current);
    requestCursorOffset();
  }, [keyboardOpen, requestCursorOffset, scrollCursorIntoView]);

  const applyEditorFlags = React.useCallback((nextShowTitles: boolean) => {
    richRef.current?.injectJavascript(setShowTitlesScript(nextShowTitles));
  }, []);

  const handleEditorInitialized = React.useCallback(() => {
    richRef.current?.injectJavascript(BULLET_EDITOR_GUARD_SCRIPT);
    applyEditorFlags(showTitlesRef.current);
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(REFRESH_CATEGORY_TIMERS_SCRIPT);
    });
  }, [applyEditorFlags]);

  const syncThoughtsFromHtml = React.useCallback(
    (html: string) => {
      const previous = getValues("thoughts");
      const next = htmlToThoughts(
        html,
        noteId,
        previous,
        showTitlesRef.current
      );
      setValue("thoughts", next, { shouldDirty: true });
    },
    [getValues, noteId, setValue]
  );

  const refreshCategoryTimers = React.useCallback(() => {
    // setContentHTML does not fire the WebView input listener.
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(REFRESH_CATEGORY_TIMERS_SCRIPT);
    });
  }, []);

  const handleClearContent = React.useCallback(() => {
    const empty = [createEmptyThought(noteId)];
    setValue("thoughts", empty, { shouldDirty: true });
    richRef.current?.setContentHTML(
      thoughtsToHtml(empty, showTitlesRef.current)
    );
    refreshCategoryTimers();
  }, [noteId, refreshCategoryTimers, setValue]);

  const handleShowTitlesChange = React.useCallback(
    (nextShowTitles: boolean) => {
      setShowTitles(nextShowTitles);
      showTitlesRef.current = nextShowTitles;
      applyEditorFlags(nextShowTitles);

      let nextThoughts = getValues("thoughts");
      if (!nextShowTitles) {
        nextThoughts = nextThoughts.map((thought) => ({
          ...thought,
          summary: thought.summary || thought.title,
        }));
        setValue("thoughts", nextThoughts, { shouldDirty: true });
      }

      richRef.current?.setContentHTML(
        thoughtsToHtml(nextThoughts, nextShowTitles)
      );
      refreshCategoryTimers();
    },
    [applyEditorFlags, getValues, refreshCategoryTimers, setValue]
  );

  const handleEditorMessage = React.useCallback(
    (message: { type: string; data?: unknown }) => {
      if (message.type !== "SELECT_CATEGORY") return;
      const index = Number(message.data);
      if (!Number.isFinite(index) || index < 0) return;
      setCategoryPickerIndex(index);
      openCategorySheet();
    },
    [openCategorySheet]
  );

  const handleSelectCategory = React.useCallback(
    (category: Category) => {
      if (categoryPickerIndex == null) return;
      const previous = getValues("thoughts");
      const next = previous.map((thought, index) =>
        index === categoryPickerIndex
          ? { ...thought, categoryId: category.id }
          : thought
      );
      setValue("thoughts", next, { shouldDirty: true });
      richRef.current?.injectJavascript(
        setThoughtCategoryScript(categoryPickerIndex, category.id)
      );
      closeCategorySheet();
      setCategoryPickerIndex(null);
    },
    [categoryPickerIndex, closeCategorySheet, getValues, setValue]
  );

  const backgroundColor = hsl("card", colorScheme);
  const textColor = hsl("text", colorScheme);
  const placeholderColor = hsl("muted-foreground", colorScheme);
  const caretColor = hsl("primary", colorScheme);
  const headerBg = hsl("muted", colorScheme);
  const mutedFg = hsl("muted-foreground", colorScheme);

  return (
    <BottomSheet className="flex-1 min-h-0">
      <View className="flex-col flex-1 min-h-0">
        <Label className="mb-0 text-popover-foreground" nativeID="thoughts">
          Content
        </Label>

        <View className="flex-1 min-h-0 overflow-hidden rounded-lg border border-input bg-card">
          <View
            className="flex-row items-center justify-between shrink-0 border-b border-input px-3 py-2.5"
            style={{ backgroundColor: headerBg }}
          >
            <Button onPress={handleClearContent} variant="ghost" size="sm">
              <Typography className="text-muted-foreground text-xs">
                Clear
              </Typography>
            </Button>

            <View className="flex-row items-center gap-3">
              <Typography className="text-sm text-muted-foreground">
                Titles
              </Typography>
              <Switch
                checked={showTitles}
                onCheckedChange={handleShowTitlesChange}
                aria-label="Show thought titles"
                trackColor={hsl("border", colorScheme)}
                trackCheckedColor={hsl("primary", colorScheme)}
                thumbColor={hsl("card", colorScheme)}
              />
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1 min-h-0"
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            onLayout={(event) => {
              scrollViewHeightRef.current = event.nativeEvent.layout.height;
              if (keyboardOpenRef.current) {
                scrollCursorIntoView(lastCursorYRef.current);
              }
            }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: keyboardOpen ? CARET_BOTTOM_MARGIN : 12,
            }}
          >
            <RichEditor
              ref={richRef}
              style={{ flex: 1, minHeight: 160 }}
              useContainer
              pasteAsPlainText
              initialContentHTML={initialHtmlRef.current}
              placeholder=""
              editorInitializedCallback={handleEditorInitialized}
              editorStyle={{
                backgroundColor,
                color: textColor,
                caretColor,
                placeholderColor,
                contentCSSText: `
                  font-size: 16px;
                  line-height: 1.45;
                  padding: 12px;
                `,
                cssText: `
                  ul {
                    padding-left: 0;
                    margin: 0;
                    list-style: none;
                  }
                  li.thought-item {
                    position: relative;
                    margin-bottom: 0.85em;
                    padding-left: 22px;
                  }
                  .thought-rail {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 18px;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 2;
                  }
                  .thought-stripe {
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    margin-left: -2px;
                    border-radius: 2px;
                    transform-origin: center center;
                    transition:
                      top 0.38s ease,
                      bottom 0.38s ease,
                      width 0.38s ease,
                      height 0.38s ease,
                      margin-left 0.38s ease,
                      border-radius 0.38s ease;
                  }
                  .thought-body {
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                  }
                  .thought-category {
                    height: 14px;
                    margin: 0 0 2px;
                    overflow: hidden;
                    font-size: 12px;
                    line-height: 14px;
                    color: ${mutedFg};
                    opacity: 0.85;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    transition:
                      opacity 0.28s ease,
                      height 0.38s ease,
                      margin 0.38s ease;
                  }
                  .thought-category-name {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                  .thought-fields {
                    min-width: 0;
                  }
                  li.thought-item.is-collapsed .thought-category {
                    opacity: 0;
                    height: 0;
                    margin: 0;
                    pointer-events: none;
                  }
                  li.thought-item.is-collapsed .thought-stripe {
                    top: 8px;
                    bottom: auto;
                    width: 6px;
                    height: 6px;
                    margin-left: -3px;
                    border-radius: 999px;
                  }
                  @keyframes thought-dot-bounce {
                    0%, 100% { transform: scale(1); }
                    35% { transform: scale(1.45); }
                    60% { transform: scale(0.88); }
                  }
                  .thought-stripe.is-bouncing {
                    animation: thought-dot-bounce 0.32s ease 2;
                  }
                  .thought-title,
                  .thought-summary {
                    position: relative;
                    min-height: 1.35em;
                  }
                  .thought-title {
                    font-weight: 700;
                    margin-bottom: 2px;
                  }
                  .thought-summary {
                    font-weight: 400;
                    opacity: 0.92;
                  }
                  /* Class-driven placeholders survive backspace better than :empty */
                  .thought-title.is-placeholder::before,
                  .thought-summary.is-placeholder::before {
                    content: attr(data-placeholder);
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: ${placeholderColor};
                    pointer-events: none;
                    font-weight: inherit;
                  }
                  .thought-title.is-placeholder::before {
                    font-weight: 700;
                  }
                  ${categoryColorsCssRef.current}
                `,
              }}
              onChange={syncThoughtsFromHtml}
              onCursorPosition={scrollCursorIntoView}
              onMessage={handleEditorMessage}
            />
          </ScrollView>
        </View>
      </View>

      <BottomSheetContent
        ref={categorySheetRef}
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        onDismiss={() => setCategoryPickerIndex(null)}
      >
        <BottomSheetView className="gap-5 pt-6 bg-background">
          <BottomSheetHeader className="bg-background">
            <Typography className="text-foreground text-xl font-bold pb-1">
              Categories
            </Typography>
          </BottomSheetHeader>
          <ScrollView style={{ maxHeight: 300 }}>
            <View className="flex flex-col w-full flex-wrap gap-2">
              {categories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  item={category}
                  onPress={() => handleSelectCategory(category)}
                  selected={selectedCategoryId === category.id}
                />
              ))}
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
}
