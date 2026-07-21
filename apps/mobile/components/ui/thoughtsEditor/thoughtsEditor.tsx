import { CategoryKey } from "@repo/sqlite";
import { Category } from "@repo/zod-schemas";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { Asset } from "expo-asset";
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
import { useRouter } from "expo-router";
import { createEmptyThought, type ThoughtsEditorFormValues } from "./types";
import {
  htmlToThoughts,
  setThoughtCategoryScript,
  thoughtsToHtml,
} from "./thoughtsHtml";
import {
  BULLET_EDITOR_GUARD_SCRIPT,
  CATEGORY_COLLAPSE_SCRIPT,
  GRAPH_BUTTON_CLICK_SCRIPT,
  REFRESH_CATEGORY_TIMERS_SCRIPT,
  setShowTitlesScript,
  setSimplifiedModeScript,
} from "./bulletEditorScript";

const QUICKSAND_REGULAR = require("@/assets/fonts/Quicksand-Regular.ttf");
const QUICKSAND_BOLD = require("@/assets/fonts/Quicksand-Bold.ttf");

async function loadEditorFontFaceCss(): Promise<string> {
  const [regular, bold] = await Asset.loadAsync([
    QUICKSAND_REGULAR,
    QUICKSAND_BOLD,
  ]);
  const regularUri = regular.localUri ?? regular.uri;
  const boldUri = bold.localUri ?? bold.uri;
  return `
    @font-face {
      font-family: 'QuicksandRegular';
      src: url('${regularUri}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'QuicksandBold';
      src: url('${boldUri}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
}

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
    // Keep the caret visible when the WebView scrolls internally (fill-height mode).
    try {
      var focusEl = node.nodeType === 3 ? node.parentElement : node;
      if (focusEl && focusEl.scrollIntoView) {
        focusEl.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    } catch (e) {}
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

/** Height of the floating Clear / Titles toolbar overlay. */
const EDITOR_TOOLBAR_HEIGHT = 44;

type ThoughtsEditorProps = {
  noteId: string;
  categories: Category[];
  defaultShowTitles?: boolean;
  /** When true, content is view-only (no editing chrome / Clear). */
  readOnly?: boolean;
  /** Show a graph open button on the right of each thought. */
  showGraphButtons?: boolean;
  /** No card chrome: transparent background, no border (border still shown while editing). */
  plain?: boolean;
  /**
   * View-only plain bullets: no titles/category chrome, static dots (no stripe animation).
   * Ignored while editing (`readOnly={false}`).
   */
  simplified?: boolean;
};

export function ThoughtsEditor({
  noteId,
  categories,
  defaultShowTitles = false,
  readOnly = false,
  showGraphButtons = false,
  plain = false,
  simplified = false,
}: ThoughtsEditorProps) {
  const { colorScheme } = useColorScheme();
  const { push } = useRouter();
  const { getValues, setValue, watch } =
    useFormContext<ThoughtsEditorFormValues>();
  // Static simplified chrome only applies in the view editor.
  const effectiveSimplified = simplified && readOnly;
  const [showTitles, setShowTitles] = React.useState(
    effectiveSimplified ? false : defaultShowTitles
  );
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [fontFaceCss, setFontFaceCss] = React.useState<string | null>(null);
  const [categoryPickerIndex, setCategoryPickerIndex] = React.useState<
    number | null
  >(null);

  const richRef = React.useRef<RichEditor>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollViewHeightRef = React.useRef(0);
  const lastCursorYRef = React.useRef(0);
  const keyboardOpenRef = React.useRef(false);
  const showTitlesRef = React.useRef(showTitles);
  const effectiveShowTitles = effectiveSimplified ? false : showTitles;
  showTitlesRef.current = effectiveShowTitles;
  const simplifiedRef = React.useRef(effectiveSimplified);
  simplifiedRef.current = effectiveSimplified;
  const borderColorRef = React.useRef(hsl("border", colorScheme));
  borderColorRef.current = hsl("border", colorScheme);
  const initialHtmlRef = React.useRef(
    thoughtsToHtml(getValues("thoughts"), effectiveShowTitles, {
      showGraphButtons,
    })
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
    let cancelled = false;
    loadEditorFontFaceCss()
      .then((css) => {
        if (!cancelled) setFontFaceCss(css);
      })
      .catch(() => {
        if (!cancelled) setFontFaceCss("");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (readOnly) return;
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
  }, [readOnly, requestCursorOffset, scrollCursorIntoView]);

  React.useEffect(() => {
    if (readOnly || !keyboardOpen) return;
    scrollCursorIntoView(lastCursorYRef.current);
    requestCursorOffset();
  }, [keyboardOpen, readOnly, requestCursorOffset, scrollCursorIntoView]);

  const applyEditorFlags = React.useCallback((nextShowTitles: boolean) => {
    richRef.current?.injectJavascript(setShowTitlesScript(nextShowTitles));
  }, []);

  const applySimplifiedMode = React.useCallback((nextSimplified: boolean) => {
    richRef.current?.injectJavascript(
      setSimplifiedModeScript(nextSimplified, borderColorRef.current)
    );
  }, []);

  const handleEditorInitialized = React.useCallback(() => {
    // Apply simplified before collapse timers so plain bullets never animate.
    applyEditorFlags(showTitlesRef.current);
    applySimplifiedMode(simplifiedRef.current);
    if (readOnly) {
      richRef.current?.injectJavascript(CATEGORY_COLLAPSE_SCRIPT);
    } else {
      richRef.current?.injectJavascript(BULLET_EDITOR_GUARD_SCRIPT);
    }
    if (showGraphButtons) {
      richRef.current?.injectJavascript(GRAPH_BUTTON_CLICK_SCRIPT);
    }
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(REFRESH_CATEGORY_TIMERS_SCRIPT);
    });
  }, [applyEditorFlags, applySimplifiedMode, readOnly, showGraphButtons]);

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
      thoughtsToHtml(empty, showTitlesRef.current, { showGraphButtons })
    );
    refreshCategoryTimers();
    applySimplifiedMode(simplifiedRef.current);
  }, [
    applySimplifiedMode,
    noteId,
    refreshCategoryTimers,
    setValue,
    showGraphButtons,
  ]);

  const handleShowTitlesChange = React.useCallback(
    (nextShowTitles: boolean) => {
      if (simplifiedRef.current) return;
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
        thoughtsToHtml(nextThoughts, nextShowTitles, { showGraphButtons })
      );
      refreshCategoryTimers();
      applySimplifiedMode(simplifiedRef.current);
    },
    [
      applyEditorFlags,
      applySimplifiedMode,
      getValues,
      refreshCategoryTimers,
      setValue,
      showGraphButtons,
    ]
  );

  const lastSimplifiedRef = React.useRef(effectiveSimplified);
  React.useEffect(() => {
    if (lastSimplifiedRef.current === effectiveSimplified) return;
    lastSimplifiedRef.current = effectiveSimplified;

    if (effectiveSimplified) {
      showTitlesRef.current = false;
      applyEditorFlags(false);
      const nextThoughts = getValues("thoughts").map((thought) => ({
        ...thought,
        summary: thought.summary || thought.title,
      }));
      setValue("thoughts", nextThoughts, { shouldDirty: true });
      richRef.current?.setContentHTML(
        thoughtsToHtml(nextThoughts, false, { showGraphButtons })
      );
      refreshCategoryTimers();
      applySimplifiedMode(true);
      return;
    }

    showTitlesRef.current = showTitles;
    applyEditorFlags(showTitles);
    richRef.current?.setContentHTML(
      thoughtsToHtml(getValues("thoughts"), showTitles, { showGraphButtons })
    );
    refreshCategoryTimers();
    applySimplifiedMode(false);
  }, [
    applyEditorFlags,
    applySimplifiedMode,
    effectiveSimplified,
    getValues,
    refreshCategoryTimers,
    setValue,
    showGraphButtons,
    showTitles,
  ]);

  const handleEditorMessage = React.useCallback(
    (message: { type: string; data?: unknown }) => {
      if (message.type === "OPEN_GRAPH") {
        const thoughtId = String(message.data ?? "");
        if (!thoughtId) return;
        push({
          pathname: "/graph/[id]",
          params: {
            id: thoughtId,
            _t: Date.now(),
          },
        });
        return;
      }
      if (readOnly || message.type !== "SELECT_CATEGORY") return;
      const index = Number(message.data);
      if (!Number.isFinite(index) || index < 0) return;
      setCategoryPickerIndex(index);
      openCategorySheet();
    },
    [openCategorySheet, push, readOnly]
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

  const backgroundColor = plain ? "transparent" : hsl("card", colorScheme);
  const textColor = hsl("text", colorScheme);
  const placeholderColor = hsl("muted-foreground", colorScheme);
  const caretColor = hsl("primary", colorScheme);
  const headerBg = hsl("muted", colorScheme);
  const mutedFg = hsl("muted-foreground", colorScheme);
  const graphButtonColor = mutedFg;
  const showToolbar = !readOnly;
  const showEditBorder = !readOnly;

  return (
    <BottomSheet className="flex-1 min-h-0">
      <View className="flex-col flex-1 min-h-0">
        {!readOnly && !plain ? (
          <Label className="mb-0 text-popover-foreground" nativeID="thoughts">
            Content
          </Label>
        ) : null}

        <View
          className={
            plain && !showEditBorder
              ? "relative flex-1 min-h-0 overflow-hidden"
              : "relative flex-1 min-h-0 overflow-hidden rounded-lg border border-input"
          }
          style={
            plain
              ? { backgroundColor: "transparent" }
              : { backgroundColor: hsl("card", colorScheme) }
          }
        >
          {showToolbar ? (
            <View
              className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between border-b border-input px-3"
              style={{
                height: EDITOR_TOOLBAR_HEIGHT,
                backgroundColor: headerBg,
              }}
            >
              <Button onPress={handleClearContent} variant="ghost" size="sm">
                <Typography className="text-muted-foreground text-xs">
                  Clear
                </Typography>
              </Button>

              {showToolbar && !effectiveSimplified ? (
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
              ) : (
                <View />
              )}
            </View>
          ) : null}

          <View
            className="flex-1 min-h-0"
            style={{
              paddingTop: showToolbar ? EDITOR_TOOLBAR_HEIGHT : 0,
              paddingBottom:
                !readOnly && keyboardOpen ? CARET_BOTTOM_MARGIN : 0,
            }}
            onLayout={(event) => {
              scrollViewHeightRef.current = event.nativeEvent.layout.height;
              if (keyboardOpenRef.current) {
                scrollCursorIntoView(lastCursorYRef.current);
              }
            }}
          >
            {fontFaceCss == null ? null : (
              <RichEditor
                ref={richRef}
                style={{ flex: 1 }}
                useContainer={false}
                scrollEnabled
                nestedScrollEnabled
                disabled={readOnly}
                pasteAsPlainText
                initialContentHTML={initialHtmlRef.current}
                placeholder=""
                editorInitializedCallback={handleEditorInitialized}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                originWhitelist={["*"]}
                editorStyle={{
                  backgroundColor,
                  color: textColor,
                  caretColor,
                  placeholderColor,
                  initialCSSText: fontFaceCss,
                  contentCSSText: `
                  font-family: 'QuicksandRegular', sans-serif;
                  font-size: 16px;
                  line-height: 1.45;
                  padding: ${plain ? "8px 2px" : "12px"};
                  min-height: 100%;
                  box-sizing: border-box;
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
                    padding-right: ${showGraphButtons ? "40px" : "0"};
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
                  .thought-graph {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${graphButtonColor};
                    opacity: 0.8;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 3;
                  }
                  .thought-graph svg {
                    display: block;
                    pointer-events: none;
                  }
                  .thought-category {
                    height: 14px;
                    margin: 0 0 2px;
                    overflow: hidden;
                    font-family: 'QuicksandRegular', sans-serif;
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
                    font-family: 'QuicksandBold', sans-serif;
                    font-weight: normal;
                    margin-bottom: 2px;
                    opacity: 0.75;
                  }
                  .thought-summary {
                    font-family: 'QuicksandRegular', sans-serif;
                    font-weight: normal;
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
                    font-family: inherit;
                    font-weight: inherit;
                  }
                  ${categoryColorsCssRef.current}
                `,
                }}
                onChange={readOnly ? undefined : syncThoughtsFromHtml}
                onCursorPosition={readOnly ? undefined : scrollCursorIntoView}
                onMessage={handleEditorMessage}
              />
            )}
          </View>
        </View>
      </View>

      {!readOnly ? (
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
      ) : null}
    </BottomSheet>
  );
}
