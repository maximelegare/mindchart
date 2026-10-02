import {
  Category,
  getThoughtPlainText,
  type ThoughtType,
} from "@repo/zod-schemas";
import React from "react";
import { Keyboard, Platform, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useFormContext } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RichEditor, actions } from "react-native-pell-rich-editor";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
  useBottomSheetContext,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { Label } from "@/components/ui/label";
import { Check } from "@/lib/icons/Check";
import { cn } from "@/lib/cn";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { useRouter } from "expo-router";
import { setGraphModeImmediate } from "@/features/graph/context/graphContext";
import {
  convertThoughtType,
  createEmptyThought,
  setTextThoughtStyle,
  setThoughtContentText,
  type ThoughtsEditorFormValues,
  type ThoughtsFormValue,
} from "./types";
import {
  htmlToThoughts,
  setThoughtCategoryScript,
  setThoughtSemanticTitleScript,
  joinMergedThoughtHtml,
  sanitizeInlineHtml,
  stripHtml,
  thoughtsToHtml,
  buildCategoryLabelsScript,
} from "./thoughtsHtml";
import {
  BULLET_EDITOR_GUARD_SCRIPT,
  CHECKLIST_SCRIPT,
  REFRESH_CATEGORY_TIMERS_SCRIPT,
  SYNC_CHECKLIST_LAYOUT_SCRIPT,
  clearThoughtValidationErrorsScript,
  setEditingModeScript,
  setShowTitlesScript,
  setSimplifiedModeScript,
  setThoughtTypeScript,
  setThoughtValidationErrorsScript,
  setSelectedThoughtScript,
  setMergeHighlightScript,
  setThoughtTextEditableScript,
  setShowCategoryColorsScript,
  setCategoryOpacityScript,
  REQUEST_EDITOR_HTML_SCRIPT,
  focusThoughtScript,
  THOUGHT_SPLIT_SCRIPT,
  startThoughtSplitScript,
  setThoughtSplitSideScript,
  confirmThoughtSplitScript,
  cancelThoughtSplitScript,
  applyParagraphSplitScript,
} from "./bulletEditorScript";
import {
  ThoughtsEditorContentLabel,
  buildThoughtPlaceholdersScript,
  getThoughtFieldPlaceholders,
} from "./thoughtsEditorLabels";
import {
  ThoughtsEditorToolbar,
  THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE,
  TOOLBAR_HEIGHT_ANIMATION_MS,
  getThoughtsEditorToolbarHeight,
  type ThoughtsToolbarMode,
} from "./thoughtsEditorToolbar";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";
import { thoughtCapabilities } from "./thoughtCapabilities";
import { useEditorNlp } from "@/features/nlp/useEditorNlp";
import { useModal } from "@/components/ui/modal/modal";
import { ThoughtTitleModalContent } from "./thoughtTitleModalContent";
import { useNoteDetailsViewStore } from "@/features/notes/noteDetails/context/noteDetailsViewContext";
import { generateID } from "@/utils/genrateID";

export type { ThoughtsFormValue, ThoughtsEditorFormValues } from "./types";
export { createEmptyThought, convertThoughtType } from "./types";

/** Gap between the caret and the keyboard / format bar. */
const CARET_BOTTOM_MARGIN = 15;

const scrollCaretIntoViewScript = (bottomMargin: number) => `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

  var margin = ${Math.max(0, Math.floor(bottomMargin))};
  var sel = window.getSelection();
  var rect = null;
  if (sel && sel.rangeCount > 0) {
    var range = sel.getRangeAt(0).cloneRange();
    rect = range.getClientRects()[0] || range.getBoundingClientRect();
  }
  if (!rect || (rect.height === 0 && rect.width === 0)) {
    var thought = document.querySelector(".thought-item.is-selected");
    if (thought) rect = thought.getBoundingClientRect();
  }
  if (!rect || (rect.height === 0 && rect.width === 0)) return true;

  var contentRect = content.getBoundingClientRect();
  var layoutBottom = contentRect.top + content.clientHeight;
  var viewBottom = layoutBottom;
  var viewTop = contentRect.top;
  if (window.visualViewport) {
    var vvTop = window.visualViewport.offsetTop;
    var vvBottom = vvTop + window.visualViewport.height;
    if (vvBottom < layoutBottom - 1) viewBottom = vvBottom;
    if (vvTop > viewTop + 1) viewTop = vvTop;
  }

  var limitBottom = viewBottom - margin;
  var limitTop = viewTop + 8;
  var delta = 0;
  if (rect.bottom > limitBottom) {
    delta = Math.ceil(rect.bottom - limitBottom);
  } else if (rect.top < limitTop) {
    delta = Math.floor(rect.top - limitTop);
  }
  if (!delta) return true;

  content.scrollTop = Math.max(0, content.scrollTop + delta);
  return true;
})();
`;

function buildCategoryColorCss(categories: Category[]): string {
  return categories
    .map(
      (category) => `
      html.mc-show-categories .thought-item[data-category-id="${category.id}"] .thought-summary:not(.is-placeholder),
      html.mc-show-categories .thought-item[data-category-id="${category.id}"] .thought-title:not(.is-placeholder) {
        background-color: color-mix(in srgb, ${category.color} var(--mc-cat-wash, 18%), transparent);
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 0;
        line-height: inherit;
      }
      html.mc-show-categories .thought-item[data-category-id="${category.id}"].is-selected .thought-summary:not(.is-placeholder),
      html.mc-show-categories .thought-item[data-category-id="${category.id}"].is-selected .thought-title:not(.is-placeholder) {
        background-color: color-mix(in srgb, ${category.color} var(--mc-cat-wash-selected, 34%), transparent);
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 0;
        line-height: inherit;
      }
    `
    )
    .join("\n");
}

function setCategoryColorCssScript(css: string): string {
  return `
(function () {
  var id = "mindchart-category-colors";
  var style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = ${JSON.stringify(css)};
  (document.head || document.documentElement).appendChild(style);
  true;
})();
`;
}

function buildEditorThemeCss(colors: {
  mutedFg: string;
  surface: string;
  card: string;
  graphButtonColor: string;
}): string {
  return `
    .thought-check-box {
      border-color: ${colors.mutedFg};
      background: ${colors.surface};
    }
    .thought-check-box svg {
      color: ${colors.card};
    }
    .thought-item.is-completed[data-category-id="uncategorized"] .thought-check-box,
    .thought-item.is-completed:not([data-category-id]) .thought-check-box {
      background: ${colors.mutedFg};
      border-color: ${colors.mutedFg};
    }
    .thought-dot {
      background-color: ${colors.mutedFg};
    }
    .thought-graph {
      color: ${colors.graphButtonColor};
      background: transparent;
    }
    .thought-expand {
      color: ${colors.mutedFg};
    }
    .thought-category {
      color: ${colors.mutedFg};
    }
  `;
}

function setEditorThemeCssScript(css: string): string {
  return `
(function () {
  var id = "mindchart-editor-theme";
  var style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = ${JSON.stringify(css)};
  true;
})();
`;
}

function applyFormatInThoughtFieldScript(command: string): string {
  return `
(function () {
  var command = ${JSON.stringify(command)};
  var sel = window.getSelection();
  var node = sel && sel.anchorNode;
  var inField = false;
  while (node) {
    if (
      node.nodeType === 1 &&
      node.classList &&
      (node.classList.contains("thought-summary") ||
        node.classList.contains("thought-title"))
    ) {
      inField = true;
      break;
    }
    node = node.parentNode;
  }
  if (!inField) return true;
  if (command === "bold" && node.classList.contains("thought-title")) {
    return true;
  }
  if (!document.queryCommandState(command)) {
    document.execCommand(command);
  }
  true;
})();
`;
}

type CategoryListItemProps = {
  item: Category;
  label: string;
  onPress: () => void;
  selected: boolean;
};

function CategoryListItem({
  item,
  label,
  onPress,
  selected,
}: CategoryListItemProps) {
  return (
    <Pressable
      className={cn("w-full rounded-lg px-2 py-4", selected && "bg-border")}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor: item.color,
            }}
          />
          <Typography variant="p" className="text-foreground">
            {label}
          </Typography>
        </View>
        {selected ? <Check className="text-accent-foreground" /> : null}
      </View>
    </Pressable>
  );
}

/** Presents the category sheet from inside the BottomSheet provider. */
function CategorySheetPresenter({ open }: { open: boolean }) {
  const { sheetRef } = useBottomSheetContext();

  React.useEffect(() => {
    if (!open) return;
    Keyboard.dismiss();
    const timer = setTimeout(() => {
      Keyboard.dismiss();
      sheetRef.current?.present();
    }, 40);
    return () => clearTimeout(timer);
  }, [open, sheetRef]);

  return null;
}

type ThoughtsEditorProps = {
  noteId: string;
  categories: Category[];
  defaultShowTitles?: boolean;
  /** When true, content is view-only (no editing chrome). */
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
  /** Dock the format toolbar to the keyboard (note details). */
  dockToolbarToKeyboard?: boolean;
  /** Enter edit mode when the format toolbar is requested from view. */
  onRequestEdit?: () => void;
  /** Persist completion when the checkbox is toggled in view mode. */
  onToggleCompleted?: (thought: { id: string; isCompleted: boolean }) => void;
  /** Persist category when it is changed in view mode. */
  onChangeCategory?: (thought: { id: string; categoryId: string }) => void;
  /** True while split or merge is using the toolbar session. */
  onToolSessionChange?: (active: boolean) => void;
};

export type ThoughtsEditorHandle = {
  /** Returns true when thoughts are valid to save. Applies red placeholders when not. */
  validateRequiredContent: () => boolean;
  clearValidationErrors: () => void;
  /** Whether any thought currently has a title. */
  titlesEnabled: () => boolean;
  /** Pull live WebView HTML into form state before save. */
  flushThoughts: () => Promise<ThoughtsFormValue[]>;
  /** Run pending NLP for dirty thoughts without waiting for debounce. */
  flushPendingNlp: () => void;
};

function ThoughtsEditorInner(
  {
    noteId,
    categories,
    readOnly = false,
    plain = false,
    dockToolbarToKeyboard = false,
    onToggleCompleted,
    onChangeCategory,
    onRequestEdit,
    onToolSessionChange,
  }: ThoughtsEditorProps,
  ref: React.ForwardedRef<ThoughtsEditorHandle>
) {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const categoryLabels = useCategoryLabelsMap();
  const { push } = useRouter();
  const { openModal } = useModal();
  const { getValues, setValue, watch } =
    useFormContext<ThoughtsEditorFormValues>();
  const hideCategories = useNoteDetailsViewStore((state) => state.simplified);
  const categoryOpacity = useNoteDetailsViewStore(
    (state) => state.categoryOpacity
  );
  const toggleHideCategories = useNoteDetailsViewStore(
    (state) => state.toggleSimplified
  );
  const setCategoryOpacity = useNoteDetailsViewStore(
    (state) => state.setCategoryOpacity
  );
  // Static simplified chrome only applies in the view editor.
  const effectiveSimplified = hideCategories && readOnly;
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [activeFormats, setActiveFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [caretThoughtType, setCaretThoughtType] = React.useState<ThoughtType>(
    () => getValues("thoughts")?.[0]?.type ?? "li"
  );
  const [toolbarMode, setToolbarMode] = React.useState<ThoughtsToolbarMode>(
    () => (readOnly ? "details" : "format")
  );
  const showCategoryColors =
    (readOnly || toolbarMode === "details") && !hideCategories;
  const [selectedThoughtIndex, setSelectedThoughtIndex] = React.useState(0);
  const [categoryPickerIndex, setCategoryPickerIndex] = React.useState<
    number | null
  >(null);
  const [splitSide, setSplitSide] = React.useState<"left" | "right" | null>(
    null
  );
  const [splitCategoryId, setSplitCategoryId] = React.useState<string | null>(
    null
  );
  const [splitCategoryPicking, setSplitCategoryPicking] = React.useState(false);
  const [merging, setMerging] = React.useState(false);
  const [mergeIndexes, setMergeIndexes] = React.useState<number[]>([]);
  const [mergeCategoryId, setMergeCategoryId] = React.useState<string | null>(
    null
  );
  const [mergeCategoryPicking, setMergeCategoryPicking] = React.useState(false);

  const richRef = React.useRef<RichEditor>(null);
  const editorReadyRef = React.useRef(false);
  const scrollViewHeightRef = React.useRef(0);
  const keyboardOpenRef = React.useRef(false);
  const keyboardHeightRef = React.useRef(0);
  const toolbarModeRef = React.useRef(toolbarMode);
  const scrollCaretFrameRef = React.useRef<number | null>(null);
  const pendingFormatRef = React.useRef<"bold" | "italic" | "underline" | null>(
    null
  );
  const selectedThoughtIndexRef = React.useRef(selectedThoughtIndex);
  selectedThoughtIndexRef.current = selectedThoughtIndex;
  const mergingRef = React.useRef(merging);
  mergingRef.current = merging;
  const mergeIndexesRef = React.useRef(mergeIndexes);
  mergeIndexesRef.current = mergeIndexes;
  const splitSideRef = React.useRef(splitSide);
  splitSideRef.current = splitSide;
  const activeFormatsRef = React.useRef(activeFormats);
  activeFormatsRef.current = activeFormats;
  const enteringEditFocusRef = React.useRef(false);
  const preserveFormatsRef = React.useRef(false);
  const showTitlesRef = React.useRef(false);
  showTitlesRef.current = false;
  const simplifiedRef = React.useRef(effectiveSimplified);
  simplifiedRef.current = effectiveSimplified;
  const hideCategoriesRef = React.useRef(hideCategories);
  hideCategoriesRef.current = hideCategories;
  const lastHtmlRef = React.useRef("");
  const pendingHtmlSyncRef = React.useRef<((html: string) => void) | null>(
    null
  );
  const mutedFg = hsl("muted-foreground", colorScheme);
  const cardColor = hsl("card", colorScheme);
  const surfaceColor = plain
    ? hsl("background", colorScheme)
    : hsl("card", colorScheme);
  const graphButtonColor = mutedFg;
  const markerColorRef = React.useRef(mutedFg);
  markerColorRef.current = mutedFg;
  const surfaceColorRef = React.useRef(surfaceColor);
  surfaceColorRef.current = surfaceColor;
  const editorThemeCss = React.useMemo(
    () =>
      buildEditorThemeCss({
        mutedFg,
        surface: surfaceColor,
        card: cardColor,
        graphButtonColor,
      }),
    [cardColor, graphButtonColor, mutedFg, surfaceColor]
  );
  const editorThemeCssRef = React.useRef(editorThemeCss);
  editorThemeCssRef.current = editorThemeCss;
  const thoughtPlaceholders = React.useMemo(
    () => getThoughtFieldPlaceholders(),
    []
  );
  const categoryLabelsRecord = React.useMemo(
    () => Object.fromEntries(categoryLabels),
    [categoryLabels]
  );
  const htmlOptions = React.useMemo(
    () => ({
      showGraphButtons: false,
      preferSemanticTitle: false,
      placeholders: {
        title: thoughtPlaceholders.title,
        summary: thoughtPlaceholders.summary,
        bullet: thoughtPlaceholders.bullet,
      },
      categoryLabels: categoryLabelsRecord,
    }),
    [thoughtPlaceholders, categoryLabelsRecord]
  );
  const validationMessages = React.useMemo(
    () => ({
      titleRequired: thoughtPlaceholders.titleRequired,
      summaryRequired: thoughtPlaceholders.summaryRequired,
      emptyBullet: thoughtPlaceholders.emptyBullet,
    }),
    [thoughtPlaceholders]
  );
  const initialHtmlRef = React.useRef(
    thoughtsToHtml(getValues("thoughts"), false, htmlOptions)
  );
  const categoryColorsCss = React.useMemo(
    () => buildCategoryColorCss(categories),
    [categories]
  );
  const categoryColorsCssRef = React.useRef(categoryColorsCss);
  categoryColorsCssRef.current = categoryColorsCss;
  const { ref: categorySheetRef, close: closeCategorySheet } = useBottomSheet();

  const thoughts = watch("thoughts");
  const selectedThought = thoughts?.[selectedThoughtIndex] ?? null;
  const selectedTitleText = (selectedThought?.title ?? "").replace(
    /<[^>]+>/g,
    ""
  );
  const selectedCategoryId = splitCategoryPicking
    ? (splitCategoryId ?? "uncategorized")
    : mergeCategoryPicking
      ? (mergeCategoryId ?? "uncategorized")
      : categoryPickerIndex != null
        ? (thoughts?.[categoryPickerIndex]?.categoryId ?? "uncategorized")
        : null;
  const selectedCategory =
    categories.find(
      (category) =>
        category.id === (selectedThought?.categoryId || "uncategorized")
    ) ?? null;
  const splitCategory =
    categories.find(
      (category) => category.id === (splitCategoryId || "uncategorized")
    ) ?? null;
  const mergeCategory =
    categories.find(
      (category) => category.id === (mergeCategoryId || "uncategorized")
    ) ?? null;
  const toolbarCategoryId = splitSide
    ? (splitCategoryId ?? "uncategorized")
    : merging
      ? (mergeCategoryId ?? "uncategorized")
      : selectedThought?.categoryId || "uncategorized";
  const toolbarCategoryLabel =
    categoryLabels.get(toolbarCategoryId) ??
    (splitSide
      ? splitCategory?.name
      : merging
        ? mergeCategory?.name
        : selectedCategory?.name) ??
    "Uncategorized";
  const toolbarCategoryColor = splitSide
    ? (splitCategory?.color ?? null)
    : merging
      ? (mergeCategory?.color ?? null)
      : (selectedCategory?.color ?? null);
  const mergeCanConfirm =
    mergeIndexes.length >= 2 &&
    Math.max(...mergeIndexes) - Math.min(...mergeIndexes) + 1 ===
      mergeIndexes.length;
  const pendingNlpByIndexRef = React.useRef(
    new Map<number, { categoryId?: string; semanticLabel?: string }>()
  );

  const injectIfReady = React.useCallback((script: string) => {
    if (!editorReadyRef.current) return;
    richRef.current?.injectJavascript(script);
  }, []);

  const { flushPendingNlp, processThoughtNow } = useEditorNlp({
    getValues,
    setValue,
    noteId,
    readOnly,
    thoughts,
    injectIfReady,
    applyParagraphSplitScript,
    setThoughtCategoryScript,
    setThoughtSemanticTitleScript,
    categoryLabels,
  });

  const focusSelectedThought = React.useCallback((atEnd: boolean) => {
    const index = selectedThoughtIndexRef.current;
    const editor = richRef.current as
      | (RichEditor & { showAndroidKeyboard?: () => void })
      | null;
    if (!editorReadyRef.current || !editor) return;
    editor.injectJavascript(focusThoughtScript(index, atEnd));
    editor.showAndroidKeyboard?.();
    editor.focusContentEditor();
  }, []);

  const scrollCaretIntoView = React.useCallback(() => {
    const margin = keyboardOpenRef.current ? CARET_BOTTOM_MARGIN : 15;
    richRef.current?.injectJavascript(scrollCaretIntoViewScript(margin));
  }, []);

  const scheduleScrollCaretIntoView = React.useCallback(() => {
    if (scrollCaretFrameRef.current != null) return;
    scrollCaretFrameRef.current = requestAnimationFrame(() => {
      scrollCaretFrameRef.current = null;
      scrollCaretIntoView();
    });
  }, [scrollCaretIntoView]);

  const tryApplyPendingFormat = React.useCallback(() => {
    const pending = pendingFormatRef.current;
    if (!pending) return;
    richRef.current?.injectJavascript(applyFormatInThoughtFieldScript(pending));
  }, []);

  const applyKeyboardOpen = React.useCallback((height: number) => {
    const nextHeight = Math.max(0, height);
    keyboardOpenRef.current = true;
    keyboardHeightRef.current = nextHeight;
    setKeyboardOpen(true);
    setKeyboardHeight(nextHeight);
  }, []);

  const applyKeyboardClosed = React.useCallback(() => {
    keyboardOpenRef.current = false;
    keyboardHeightRef.current = 0;
    pendingFormatRef.current = null;
    setKeyboardOpen(false);
    setKeyboardHeight(0);
  }, []);

  useKeyboardHandler(
    {
      onStart: (event) => {
        "worklet";
        if (event.progress === 1) {
          runOnJS(applyKeyboardOpen)(Math.max(0, event.height));
        } else {
          runOnJS(applyKeyboardClosed)();
        }
      },
    },
    [applyKeyboardOpen, applyKeyboardClosed]
  );

  React.useEffect(() => {
    if (readOnly) return;

    const refreshCaret = () => {
      tryApplyPendingFormat();
      scrollCaretIntoView();
    };

    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      applyKeyboardOpen(event.endCoordinates.height);
      requestAnimationFrame(() => {
        requestAnimationFrame(refreshCaret);
      });
      setTimeout(refreshCaret, 100);
      setTimeout(refreshCaret, 280);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      applyKeyboardClosed();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      if (scrollCaretFrameRef.current != null) {
        cancelAnimationFrame(scrollCaretFrameRef.current);
        scrollCaretFrameRef.current = null;
      }
    };
  }, [
    applyKeyboardClosed,
    applyKeyboardOpen,
    readOnly,
    scrollCaretIntoView,
    tryApplyPendingFormat,
  ]);

  React.useEffect(() => {
    if (readOnly || keyboardHeight <= 0) return;
    const frame = requestAnimationFrame(() => {
      scrollCaretIntoView();
    });
    const later = setTimeout(() => {
      scrollCaretIntoView();
    }, 160);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(later);
    };
  }, [keyboardHeight, readOnly, scrollCaretIntoView]);

  React.useEffect(() => {
    if (readOnly || !keyboardOpen || dockToolbarToKeyboard) return;
    const pad =
      CARET_BOTTOM_MARGIN +
      getThoughtsEditorToolbarHeight(toolbarMode) +
      THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE / 2;
    injectIfReady(`
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) content.style.paddingBottom = "${pad}px";
  true;
})();
`);
    scrollCaretIntoView();
  }, [
    keyboardOpen,
    readOnly,
    dockToolbarToKeyboard,
    scrollCaretIntoView,
    injectIfReady,
    toolbarMode,
  ]);

  React.useEffect(() => {
    if (readOnly || keyboardOpen || dockToolbarToKeyboard) return;
    injectIfReady(`
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) content.style.paddingBottom = "12px";
  true;
})();
`);
  }, [keyboardOpen, readOnly, dockToolbarToKeyboard, injectIfReady]);

  const applyEditorFlags = React.useCallback(
    (nextShowTitles = false) => {
      if (!editorReadyRef.current) return;
      richRef.current?.injectJavascript(setShowTitlesScript(nextShowTitles));
      richRef.current?.injectJavascript(setEditingModeScript(!readOnly));
    },
    [readOnly]
  );

  const applyCategoryColors = React.useCallback((css: string) => {
    if (!css || !editorReadyRef.current) return;
    richRef.current?.injectJavascript(setCategoryColorCssScript(css));
  }, []);

  const applyEditorTheme = React.useCallback((css: string) => {
    if (!css || !editorReadyRef.current) return;
    richRef.current?.injectJavascript(setEditorThemeCssScript(css));
  }, []);

  React.useEffect(() => {
    applyCategoryColors(categoryColorsCss);
  }, [applyCategoryColors, categoryColorsCss]);

  const applySimplifiedMode = React.useCallback((nextSimplified: boolean) => {
    if (!editorReadyRef.current) return;
    richRef.current?.injectJavascript(
      setSimplifiedModeScript(
        nextSimplified,
        markerColorRef.current,
        surfaceColorRef.current
      )
    );
  }, []);

  React.useEffect(() => {
    applyEditorTheme(editorThemeCss);
    applySimplifiedMode(simplifiedRef.current);
    applyCategoryColors(categoryColorsCss);
  }, [
    applyCategoryColors,
    applyEditorTheme,
    applySimplifiedMode,
    categoryColorsCss,
    editorThemeCss,
  ]);

  const applyPendingFormat = React.useCallback(
    (items: Array<string | { type?: string }>) => {
      const has = (action: string) =>
        items.some(
          (item) =>
            item === action ||
            (typeof item === "object" && item?.type === action)
        );
      const pending = pendingFormatRef.current;
      if (pending) {
        richRef.current?.injectJavascript(
          applyFormatInThoughtFieldScript(pending)
        );
        if (has(pending)) {
          pendingFormatRef.current = null;
        }
        setActiveFormats({
          bold: pending === "bold" || has(actions.setBold),
          italic: pending === "italic" || has(actions.setItalic),
          underline: pending === "underline" || has(actions.setUnderline),
        });
        return;
      }
      if (items.length === 0 && preserveFormatsRef.current) {
        return;
      }
      setActiveFormats({
        bold: has(actions.setBold),
        italic: has(actions.setItalic),
        underline: has(actions.setUnderline),
      });
    },
    []
  );

  const handleEditorInitialized = React.useCallback(() => {
    editorReadyRef.current = true;
    // Apply simplified before collapse timers so plain bullets never animate.
    applyEditorFlags(showTitlesRef.current);
    applySimplifiedMode(simplifiedRef.current);
    applyCategoryColors(categoryColorsCssRef.current);
    applyEditorTheme(editorThemeCssRef.current);
    richRef.current?.registerToolbar((items) => {
      applyPendingFormat(items);
    });
    if (readOnly) {
      richRef.current?.injectJavascript(
        buildCategoryLabelsScript(categoryLabelsRecord)
      );
    } else {
      richRef.current?.injectJavascript(
        buildThoughtPlaceholdersScript(thoughtPlaceholders)
      );
      richRef.current?.injectJavascript(
        buildCategoryLabelsScript(categoryLabelsRecord)
      );
      richRef.current?.injectJavascript(BULLET_EDITOR_GUARD_SCRIPT);
    }
    richRef.current?.injectJavascript(CHECKLIST_SCRIPT);
    richRef.current?.injectJavascript(THOUGHT_SPLIT_SCRIPT);
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(REFRESH_CATEGORY_TIMERS_SCRIPT);
      richRef.current?.injectJavascript(SYNC_CHECKLIST_LAYOUT_SCRIPT);
      richRef.current?.injectJavascript(setSelectedThoughtScript(0));
      richRef.current?.injectJavascript(
        setThoughtTextEditableScript(!readOnly && toolbarMode === "format")
      );
      richRef.current?.injectJavascript(
        setShowCategoryColorsScript(
          (readOnly || toolbarMode === "details") && !hideCategoriesRef.current
        )
      );
      richRef.current?.injectJavascript(
        setCategoryOpacityScript(categoryOpacity)
      );
    });
  }, [
    applyEditorFlags,
    applySimplifiedMode,
    applyCategoryColors,
    applyEditorTheme,
    applyPendingFormat,
    categoryLabelsRecord,
    readOnly,
    thoughtPlaceholders,
    toolbarMode,
    categoryOpacity,
  ]);

  React.useEffect(() => {
    injectIfReady(buildCategoryLabelsScript(categoryLabelsRecord));
  }, [categoryLabelsRecord, injectIfReady]);

  const syncThoughtsFromHtml = React.useCallback(
    (html: string) => {
      lastHtmlRef.current = html;
      const previous = getValues("thoughts");
      const next = htmlToThoughts(
        html,
        noteId,
        previous,
        showTitlesRef.current
      ).map((thought, index) => {
        const pending = pendingNlpByIndexRef.current.get(index);
        if (!pending) return thought;
        pendingNlpByIndexRef.current.delete(index);
        return {
          ...thought,
          categoryId: pending.categoryId ?? thought.categoryId,
          semanticLabel: pending.semanticLabel ?? thought.semanticLabel,
        };
      });
      setValue("thoughts", next, { shouldDirty: true });
    },
    [getValues, noteId, setValue]
  );

  const refreshCategoryTimers = React.useCallback(() => {
    if (!editorReadyRef.current) return;
    // setContentHTML does not fire the WebView input listener.
    requestAnimationFrame(() => {
      if (!editorReadyRef.current) return;
      richRef.current?.injectJavascript(REFRESH_CATEGORY_TIMERS_SCRIPT);
      richRef.current?.injectJavascript(CHECKLIST_SCRIPT);
      richRef.current?.injectJavascript(THOUGHT_SPLIT_SCRIPT);
      richRef.current?.injectJavascript(SYNC_CHECKLIST_LAYOUT_SCRIPT);
    });
  }, []);

  const wasEditingRef = React.useRef(!readOnly);
  const keepDetailsToolbarOnEditRef = React.useRef(false);

  // Entering edit installs the guard and drops graph chrome. Leaving edit
  // rebuilds HTML so graph buttons come back. Skip the initial mount —
  // editorInitializedCallback already installs scripts, and injecting
  // before the WebView exists crashes Android.
  React.useEffect(() => {
    const enteringEdit = !readOnly;
    const wasEditing = wasEditingRef.current;
    if (enteringEdit === wasEditing) return;
    wasEditingRef.current = enteringEdit;
    if (!editorReadyRef.current) return;

    if (enteringEdit) {
      const stayOnDetails = keepDetailsToolbarOnEditRef.current;
      keepDetailsToolbarOnEditRef.current = false;
      if (!stayOnDetails) {
        enteringEditFocusRef.current = true;
        setToolbarMode("format");
      }
      applyEditorFlags(false);
      applySimplifiedMode(false);
      richRef.current?.injectJavascript(
        buildThoughtPlaceholdersScript(thoughtPlaceholders)
      );
      richRef.current?.injectJavascript(
        buildCategoryLabelsScript(categoryLabelsRecord)
      );
      richRef.current?.injectJavascript(BULLET_EDITOR_GUARD_SCRIPT);
      const nextThoughts = getValues("thoughts");
      const selectedIndex = Math.min(
        Math.max(0, selectedThoughtIndex),
        Math.max(0, (nextThoughts?.length ?? 1) - 1)
      );
      selectedThoughtIndexRef.current = selectedIndex;
      setCaretThoughtType(nextThoughts?.[selectedIndex]?.type ?? "li");
      const sessionLock = mergingRef.current || splitSideRef.current != null;
      richRef.current?.injectJavascript(
        setThoughtTextEditableScript(!sessionLock)
      );
      richRef.current?.injectJavascript(
        setShowCategoryColorsScript(stayOnDetails && !hideCategoriesRef.current)
      );
      richRef.current?.injectJavascript(
        setSelectedThoughtScript(selectedIndex)
      );
      if (mergingRef.current) {
        richRef.current?.injectJavascript(
          setMergeHighlightScript(mergeIndexesRef.current)
        );
      }
      if (!stayOnDetails) {
        requestAnimationFrame(() => {
          focusSelectedThought(true);
          scheduleScrollCaretIntoView();
          enteringEditFocusRef.current = false;
        });
      }
      return;
    }

    flushPendingNlp();
    setToolbarMode("details");
    applyEditorFlags(false);
    applySimplifiedMode(simplifiedRef.current);
    const nextThoughts = getValues("thoughts");
    setCaretThoughtType(nextThoughts?.[0]?.type ?? "li");
    richRef.current?.setContentHTML(
      thoughtsToHtml(nextThoughts, false, htmlOptions)
    );
    applyCategoryColors(categoryColorsCssRef.current);
    refreshCategoryTimers();
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(
        setSelectedThoughtScript(selectedThoughtIndex)
      );
      richRef.current?.injectJavascript(setThoughtTextEditableScript(false));
      richRef.current?.injectJavascript(
        setShowCategoryColorsScript(!hideCategoriesRef.current)
      );
    });
  }, [
    applyCategoryColors,
    applyEditorFlags,
    applySimplifiedMode,
    categoryLabelsRecord,
    getValues,
    htmlOptions,
    readOnly,
    refreshCategoryTimers,
    thoughtPlaceholders,
    focusSelectedThought,
    flushPendingNlp,
    scheduleScrollCaretIntoView,
  ]);

  const viewSignature = React.useMemo(
    () =>
      readOnly
        ? (thoughts ?? [])
            .map(
              (thought) =>
                `${thought.id}:${thought.semanticLabel}:${thought.categoryId}:${thought.title}:${getThoughtPlainText(thought)}:${thought.type}`
            )
            .join("|")
        : "",
    [readOnly, thoughts]
  );
  const lastViewSignatureRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!readOnly) {
      lastViewSignatureRef.current = null;
      return;
    }
    if (!editorReadyRef.current) return;
    if (lastViewSignatureRef.current === viewSignature) return;
    const skipRebuild = lastViewSignatureRef.current == null;
    lastViewSignatureRef.current = viewSignature;
    if (skipRebuild) return;
    richRef.current?.setContentHTML(
      thoughtsToHtml(getValues("thoughts"), false, htmlOptions)
    );
    refreshCategoryTimers();
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(
        setSelectedThoughtScript(selectedThoughtIndex)
      );
      richRef.current?.injectJavascript(setThoughtTextEditableScript(false));
      richRef.current?.injectJavascript(
        setShowCategoryColorsScript(!hideCategoriesRef.current)
      );
    });
  }, [
    getValues,
    htmlOptions,
    readOnly,
    refreshCategoryTimers,
    selectedThoughtIndex,
    viewSignature,
  ]);

  const handleFormat = React.useCallback(
    (command: "bold" | "italic" | "underline") => {
      const editor = richRef.current as
        | (RichEditor & { showAndroidKeyboard?: () => void })
        | null;
      if (!editor) return;

      if (keyboardOpenRef.current && pendingFormatRef.current == null) {
        editor.showAndroidKeyboard?.();
        editor.sendAction(command, "result");
        return;
      }

      if (pendingFormatRef.current === command) {
        pendingFormatRef.current = null;
        setActiveFormats((prev) => ({ ...prev, [command]: false }));
        if (keyboardOpenRef.current) {
          editor.sendAction(command, "result");
        }
        return;
      }

      pendingFormatRef.current = command;
      setActiveFormats((prev) => ({ ...prev, [command]: true }));
      editor.focusContentEditor();
    },
    []
  );

  const handleThoughtType = React.useCallback((type: ThoughtType) => {
    setCaretThoughtType(type);
    richRef.current?.injectJavascript(setThoughtTypeScript(type));
  }, []);

  const handleToolbarModeChange = React.useCallback(
    (mode: ThoughtsToolbarMode) => {
      preserveFormatsRef.current = true;
      setTimeout(() => {
        preserveFormatsRef.current = false;
      }, 400);
      if (mode === "format") {
        injectIfReady(setShowCategoryColorsScript(false));
        setSplitSide(null);
        setSplitCategoryId(null);
        setSplitCategoryPicking(false);
        injectIfReady(cancelThoughtSplitScript());
        setMerging(false);
        setMergeIndexes([]);
        mergeIndexesRef.current = [];
        setMergeCategoryId(null);
        setMergeCategoryPicking(false);
        injectIfReady(setMergeHighlightScript([]));
      } else {
        if (hideCategoriesRef.current) {
          useNoteDetailsViewStore.getState().setSimplified(false);
        }
        injectIfReady(setShowCategoryColorsScript(true));
      }
      if (mode === "format" && readOnly) {
        onRequestEdit?.();
      }
      setToolbarMode(mode);
    },
    [injectIfReady, onRequestEdit, readOnly]
  );

  const handleToggleCategories = React.useCallback(() => {
    toggleHideCategories();
  }, [toggleHideCategories]);

  const handleCategoryOpacityChange = React.useCallback(
    (opacity: number) => {
      setCategoryOpacity(opacity);
      if (hideCategoriesRef.current) {
        useNoteDetailsViewStore.getState().setSimplified(false);
      }
      injectIfReady(setCategoryOpacityScript(opacity));
    },
    [injectIfReady, setCategoryOpacity]
  );

  const handleSplit = React.useCallback(() => {
    if (selectedThoughtIndex < 0) return;
    if (readOnly) {
      keepDetailsToolbarOnEditRef.current = true;
      onRequestEdit?.();
    }
    if (splitSide) return;
    setMerging(false);
    setMergeIndexes([]);
    setMergeCategoryId(null);
    setMergeCategoryPicking(false);
    injectIfReady(setMergeHighlightScript([]));
    setSplitSide("right");
    setSplitCategoryId(null);
    injectIfReady(
      startThoughtSplitScript("right", hsl("primary", colorScheme))
    );
  }, [
    colorScheme,
    injectIfReady,
    onRequestEdit,
    readOnly,
    selectedThoughtIndex,
    splitSide,
  ]);

  const handleSplitSide = React.useCallback(
    (side: "left" | "right") => {
      if (!splitSide || splitSide === side) return;
      setSplitSide(side);
      injectIfReady(setThoughtSplitSideScript(side));
    },
    [injectIfReady, splitSide]
  );

  const handleConfirmSplit = React.useCallback(() => {
    if (!splitSide) return;
    injectIfReady(confirmThoughtSplitScript(generateID()));
  }, [injectIfReady, splitSide]);

  const handleCancelSplit = React.useCallback(() => {
    setSplitSide(null);
    setSplitCategoryId(null);
    setSplitCategoryPicking(false);
    injectIfReady(cancelThoughtSplitScript());
  }, [injectIfReady]);

  const applyMergeTap = React.useCallback(
    (index: number) => {
      if (index < 0) return;
      const previous = mergeIndexesRef.current;
      const start = previous.length ? Math.min(...previous) : index;
      const end = previous.length ? Math.max(...previous) : index;
      let next: number[];
      if (previous.includes(index)) {
        next = previous;
      } else if (
        previous.length > 0 &&
        (index === start - 1 || index === end + 1)
      ) {
        const nextStart = Math.min(start, index);
        const nextEnd = Math.max(end, index);
        next = Array.from(
          { length: nextEnd - nextStart + 1 },
          (_, offset) => nextStart + offset
        );
      } else {
        next = [index];
        setMergeCategoryId(
          getValues("thoughts")?.[index]?.categoryId ?? "uncategorized"
        );
      }
      mergeIndexesRef.current = next;
      setMergeIndexes(next);
      setSelectedThoughtIndex(index);
      injectIfReady(setMergeHighlightScript(next));
    },
    [getValues, injectIfReady]
  );

  const handleMerge = React.useCallback(() => {
    if (selectedThoughtIndex < 0) return;
    if (merging) return;
    if (readOnly) {
      keepDetailsToolbarOnEditRef.current = true;
      onRequestEdit?.();
    }
    setSplitSide(null);
    setSplitCategoryId(null);
    setSplitCategoryPicking(false);
    injectIfReady(cancelThoughtSplitScript());
    const seed = Math.max(0, selectedThoughtIndex);
    const seedThought = getValues("thoughts")?.[seed];
    const next = [seed];
    mergeIndexesRef.current = next;
    setMerging(true);
    setMergeIndexes(next);
    setMergeCategoryId(seedThought?.categoryId ?? "uncategorized");
    setMergeCategoryPicking(false);
    injectIfReady(setMergeHighlightScript(next));
    richRef.current?.dismissKeyboard();
    Keyboard.dismiss();
  }, [
    getValues,
    injectIfReady,
    merging,
    onRequestEdit,
    readOnly,
    selectedThoughtIndex,
  ]);

  const handleCancelMerge = React.useCallback(() => {
    mergeIndexesRef.current = [];
    setMerging(false);
    setMergeIndexes([]);
    setMergeCategoryId(null);
    setMergeCategoryPicking(false);
    injectIfReady(setMergeHighlightScript([]));
  }, [injectIfReady]);

  const handleConfirmMerge = React.useCallback(() => {
    if (mergeIndexes.length < 2) return;
    const start = Math.min(...mergeIndexes);
    const end = Math.max(...mergeIndexes);
    if (end - start + 1 !== mergeIndexes.length) return;
    const previous = getValues("thoughts");
    const pieces = previous.slice(start, end + 1);
    const first = pieces[0];
    if (!first || pieces.length < 2) return;
    const joined = pieces.reduce(
      (html, thought, index) =>
        index === 0
          ? thought.content.text
          : joinMergedThoughtHtml(html, thought.content.text),
      ""
    );
    const merged = setThoughtContentText(
      {
        ...first,
        categoryId: mergeCategoryId ?? first.categoryId,
      },
      joined
    );
    const nextThoughts = [
      ...previous.slice(0, start),
      merged,
      ...previous.slice(end + 1),
    ];
    setValue("thoughts", nextThoughts, { shouldDirty: true });
    mergeIndexesRef.current = [];
    setMerging(false);
    setMergeIndexes([]);
    setMergeCategoryId(null);
    setMergeCategoryPicking(false);
    setSelectedThoughtIndex(start);
    richRef.current?.setContentHTML(
      thoughtsToHtml(nextThoughts, false, htmlOptions)
    );
    refreshCategoryTimers();
    requestAnimationFrame(() => {
      injectIfReady(setMergeHighlightScript([]));
      injectIfReady(setSelectedThoughtScript(start));
    });
    richRef.current?.dismissKeyboard();
    Keyboard.dismiss();
  }, [
    getValues,
    htmlOptions,
    injectIfReady,
    mergeCategoryId,
    mergeIndexes,
    refreshCategoryTimers,
    setValue,
  ]);

  React.useEffect(() => {
    if (!merging) {
      injectIfReady(setMergeHighlightScript([]));
      return;
    }
    injectIfReady(setMergeHighlightScript(mergeIndexes));
  }, [injectIfReady, mergeIndexes, merging]);

  const applySplitThought = React.useCallback(
    (payload: {
      index: number;
      newSide: "left" | "right";
      newThoughtId: string;
      leftHtml: string;
      rightHtml: string;
    }) => {
      const previous = getValues("thoughts");
      const source = previous[payload.index];
      if (!source) return;
      const leftText = sanitizeInlineHtml(payload.leftHtml);
      const rightText = sanitizeInlineHtml(payload.rightHtml);
      const newText = payload.newSide === "left" ? leftText : rightText;
      const keptText = payload.newSide === "left" ? rightText : leftText;
      const created = createEmptyThought(noteId, source.type);
      const sourceStyle =
        source.type === "text" && source.content.style === "inline"
          ? "inline"
          : "block";
      const styleForSide = (side: "left" | "right") =>
        side === "right" ? "inline" : sourceStyle;
      const newThought = setThoughtContentText(
        source.type === "text"
          ? setTextThoughtStyle(
              {
                ...created,
                id: payload.newThoughtId,
                thoughtId: payload.newThoughtId,
                categoryId: splitCategoryId ?? "uncategorized",
              },
              styleForSide(payload.newSide)
            )
          : {
              ...created,
              id: payload.newThoughtId,
              thoughtId: payload.newThoughtId,
              categoryId: splitCategoryId ?? "uncategorized",
            },
        newText
      );
      const kept = setThoughtContentText(
        source.type === "text"
          ? setTextThoughtStyle(
              source,
              styleForSide(payload.newSide === "left" ? "right" : "left")
            )
          : source,
        keptText
      );
      const next =
        payload.newSide === "right"
          ? [
              ...previous.slice(0, payload.index),
              kept,
              newThought,
              ...previous.slice(payload.index + 1),
            ]
          : [
              ...previous.slice(0, payload.index),
              newThought,
              kept,
              ...previous.slice(payload.index + 1),
            ];
      const pickerIndex =
        payload.newSide === "right" ? payload.index + 1 : payload.index;
      setValue("thoughts", next, { shouldDirty: true });
      setSelectedThoughtIndex(pickerIndex);
      setSplitSide(null);
      injectIfReady(setSelectedThoughtScript(pickerIndex));
      injectIfReady(SYNC_CHECKLIST_LAYOUT_SCRIPT);
      if (splitCategoryId && splitCategoryId !== "uncategorized") {
        injectIfReady(
          setThoughtCategoryScript(
            pickerIndex,
            splitCategoryId,
            categoryLabels.get(splitCategoryId)
          )
        );
      }
      const pickedCategory = splitCategoryId;
      setSplitCategoryId(null);
      setSplitCategoryPicking(false);
      richRef.current?.dismissKeyboard();
      Keyboard.dismiss();
      if (!pickedCategory) {
        setCategoryPickerIndex(pickerIndex);
      }
    },
    [
      categoryLabels,
      getValues,
      injectIfReady,
      noteId,
      setValue,
      splitCategoryId,
    ]
  );

  const handleOpenSelectedCategory = React.useCallback(() => {
    if (splitSide) {
      richRef.current?.dismissKeyboard();
      Keyboard.dismiss();
      setSplitCategoryPicking(true);
      return;
    }
    if (merging) {
      richRef.current?.dismissKeyboard();
      Keyboard.dismiss();
      setMergeCategoryPicking(true);
      return;
    }
    if (selectedThoughtIndex < 0) return;
    richRef.current?.dismissKeyboard();
    Keyboard.dismiss();
    setCategoryPickerIndex(selectedThoughtIndex);
  }, [merging, selectedThoughtIndex, splitSide]);

  const handleOpenSelectedGraph = React.useCallback(() => {
    const thought = getValues("thoughts")?.[selectedThoughtIndex];
    const thoughtId = thought?.thoughtId || thought?.id;
    if (!thoughtId) return;
    setGraphModeImmediate("category");
    push({
      pathname: "/graph/[id]",
      params: {
        id: thoughtId,
        graph: "category",
        _t: Date.now(),
      },
    });
  }, [getValues, push, selectedThoughtIndex]);

  const handleEditTitle = React.useCallback(() => {
    const index = selectedThoughtIndex;
    if (index < 0) return;
    const currentTitle = getValues("thoughts")?.[index]?.title ?? "";
    openModal({
      customContent: () => (
        <ThoughtTitleModalContent
          initialTitle={currentTitle}
          onSave={(title) => {
            const previous = getValues("thoughts");
            if (!previous[index]) return;
            setValue(
              "thoughts",
              previous.map((thought, thoughtIndex) =>
                thoughtIndex === index
                  ? { ...thought, title, titleSource: "user" as const }
                  : thought
              ),
              { shouldDirty: true }
            );
            if (readOnly) {
              keepDetailsToolbarOnEditRef.current = true;
              onRequestEdit?.();
            }
          }}
        />
      ),
    });
  }, [
    getValues,
    onRequestEdit,
    openModal,
    readOnly,
    selectedThoughtIndex,
    setValue,
  ]);

  React.useEffect(() => {
    const textEditable =
      !readOnly && toolbarMode === "format" && !splitSide && !merging;
    injectIfReady(setThoughtTextEditableScript(textEditable));
    injectIfReady(setShowCategoryColorsScript(showCategoryColors));
    injectIfReady(setCategoryOpacityScript(categoryOpacity));
    if (readOnly || splitSide || merging) {
      richRef.current?.dismissKeyboard();
    }
  }, [
    categoryOpacity,
    injectIfReady,
    merging,
    readOnly,
    showCategoryColors,
    splitSide,
    toolbarMode,
  ]);

  React.useEffect(() => {
    const previous = toolbarModeRef.current;
    toolbarModeRef.current = toolbarMode;
    if (previous === toolbarMode) return;
    if (readOnly || !editorReadyRef.current) return;
    if (enteringEditFocusRef.current) return;
    if (mergingRef.current || splitSide) return;
    focusSelectedThought(false);
  }, [focusSelectedThought, readOnly, splitSide, toolbarMode]);

  React.useEffect(() => {
    const length = thoughts?.length ?? 0;
    if (length === 0) return;
    if (selectedThoughtIndex >= length) {
      setSelectedThoughtIndex(Math.max(0, length - 1));
    }
  }, [selectedThoughtIndex, thoughts?.length]);

  const lastSimplifiedRef = React.useRef(effectiveSimplified);
  React.useEffect(() => {
    if (lastSimplifiedRef.current === effectiveSimplified) return;
    lastSimplifiedRef.current = effectiveSimplified;
    applySimplifiedMode(effectiveSimplified);
  }, [applySimplifiedMode, effectiveSimplified]);

  const handleEditorMessage = React.useCallback(
    (message: { type: string; data?: unknown }) => {
      if (message.type === "DISMISS_KEYBOARD") {
        richRef.current?.dismissKeyboard();
        Keyboard.dismiss();
        return;
      }
      if (message.type === "HTML_SYNC") {
        const html = typeof message.data === "string" ? message.data : "";
        lastHtmlRef.current = html;
        syncThoughtsFromHtml(html);
        pendingHtmlSyncRef.current?.(html);
        pendingHtmlSyncRef.current = null;
        return;
      }
      if (message.type === "OPEN_GRAPH") {
        const thoughtId = String(message.data ?? "");
        if (!thoughtId) return;
        setGraphModeImmediate("category");
        push({
          pathname: "/graph/[id]",
          params: {
            id: thoughtId,
            graph: "category",
            _t: Date.now(),
          },
        });
        return;
      }
      if (message.type === "CARET_LIST_TYPE") {
        const payload = message.data as
          | { type?: ThoughtType; completable?: boolean; index?: number }
          | undefined;
        const nextType: ThoughtType =
          payload?.type === "text" ||
          payload?.type === "li" ||
          payload?.type === "checkbox"
            ? payload.type
            : payload?.completable
              ? "checkbox"
              : "li";
        setCaretThoughtType(nextType);
        const index = Number(payload?.index);
        if (Number.isFinite(index) && index >= 0) {
          if (mergingRef.current) {
            applyMergeTap(index);
          } else {
            setSelectedThoughtIndex(index);
          }
        }
        if (keyboardOpenRef.current) {
          scheduleScrollCaretIntoView();
        }
        return;
      }
      if (message.type === "LIST_TYPE") {
        if (mergingRef.current) return;
        const payload = message.data as
          | { index?: number; type?: ThoughtType; completable?: boolean }
          | undefined;
        const index = Number(payload?.index);
        const nextType: ThoughtType =
          payload?.type === "text" ||
          payload?.type === "li" ||
          payload?.type === "checkbox"
            ? payload.type
            : payload?.completable
              ? "checkbox"
              : "li";
        if (!Number.isFinite(index) || index < 0) return;
        setCaretThoughtType(nextType);
        setSelectedThoughtIndex(index);
        const previous = getValues("thoughts");
        const current = previous[index];
        if (!current) return;
        setValue(
          "thoughts",
          previous.map((thought, thoughtIndex) =>
            thoughtIndex === index
              ? convertThoughtType(thought, nextType)
              : thought
          ),
          { shouldDirty: true }
        );
        return;
      }
      if (message.type === "TOGGLE_COMPLETED") {
        if (mergingRef.current) return;
        const payload = message.data as
          | { index?: number; completed?: boolean }
          | undefined;
        const index = Number(payload?.index);
        const completed = Boolean(payload?.completed);
        if (!Number.isFinite(index) || index < 0) return;
        const previous = getValues("thoughts");
        const current = previous[index];
        if (!current) return;
        const checkbox =
          current.type === "checkbox"
            ? current
            : convertThoughtType(current, "checkbox");
        const nextThought = {
          ...checkbox,
          type: "checkbox" as const,
          content: { text: checkbox.content.text, checked: completed },
        };
        setValue(
          "thoughts",
          previous.map((thought, thoughtIndex) =>
            thoughtIndex === index ? nextThought : thought
          ),
          { shouldDirty: !readOnly }
        );
        if (readOnly) {
          onToggleCompleted?.({
            id: nextThought.id,
            isCompleted: completed,
          });
        }
        return;
      }
      if (message.type === "SPLIT_PARAGRAPH") {
        const payload = message.data as
          | {
              index?: number;
              thoughtId?: string;
              newThoughtId?: string;
              text?: string;
            }
          | undefined;
        const index = Number(payload?.index);
        if (!Number.isFinite(index) || index < 0) return;
        const previous = getValues("thoughts");
        const thoughtId = String(payload?.thoughtId ?? "");
        const current =
          previous.find(
            (thought) =>
              thought.id === thoughtId || thought.thoughtId === thoughtId
          ) ?? previous[index];
        if (!current || !thoughtCapabilities(current.type).nlp) return;
        processThoughtNow(current, {
          id: String(payload?.newThoughtId || generateID()),
        });
        return;
      }
      if (message.type === "CLASSIFY_BULLET") {
        const payload = message.data as
          | { index?: number; text?: string }
          | undefined;
        const index = Number(payload?.index);
        if (!Number.isFinite(index) || index < 0) return;
        const current = getValues("thoughts")[index];
        if (!current || !thoughtCapabilities(current.type).nlp) return;
        processThoughtNow(current);
        return;
      }
      if (message.type === "CONFIRM_SPLIT") {
        injectIfReady(confirmThoughtSplitScript(generateID()));
        return;
      }
      if (message.type === "CANCEL_SPLIT") {
        setSplitSide(null);
        setSplitCategoryId(null);
        setSplitCategoryPicking(false);
        return;
      }
      if (message.type === "SPLIT_THOUGHT") {
        const payload = message.data as
          | {
              index?: number;
              newSide?: "left" | "right";
              newThoughtId?: string;
              leftHtml?: string;
              rightHtml?: string;
            }
          | undefined;
        const index = Number(payload?.index);
        const newSide = payload?.newSide;
        const newThoughtId = String(payload?.newThoughtId ?? "");
        if (
          !Number.isFinite(index) ||
          index < 0 ||
          (newSide !== "left" && newSide !== "right") ||
          !newThoughtId
        ) {
          return;
        }
        applySplitThought({
          index,
          newSide,
          newThoughtId,
          leftHtml: String(payload?.leftHtml ?? ""),
          rightHtml: String(payload?.rightHtml ?? ""),
        });
        return;
      }
      if (message.type !== "SELECT_CATEGORY") return;
      const index = Number(message.data);
      if (!Number.isFinite(index) || index < 0) return;
      richRef.current?.dismissKeyboard();
      Keyboard.dismiss();
      setCategoryPickerIndex(index);
    },
    [
      applyMergeTap,
      applySplitThought,
      processThoughtNow,
      categoryLabels,
      getValues,
      injectIfReady,
      onToggleCompleted,
      push,
      readOnly,
      scheduleScrollCaretIntoView,
      setValue,
      syncThoughtsFromHtml,
    ]
  );

  const handleSelectCategory = React.useCallback(
    (category: Category) => {
      if (splitCategoryPicking) {
        setSplitCategoryId(category.id);
        closeCategorySheet();
        setSplitCategoryPicking(false);
        return;
      }
      if (mergeCategoryPicking) {
        setMergeCategoryId(category.id);
        closeCategorySheet();
        setMergeCategoryPicking(false);
        return;
      }
      if (categoryPickerIndex == null) return;
      const previous = getValues("thoughts");
      const next = previous.map((thought, index) =>
        index === categoryPickerIndex
          ? {
              ...thought,
              categoryId: category.id,
              categorySource: "user" as const,
            }
          : thought
      );
      setValue("thoughts", next, { shouldDirty: !readOnly });
      richRef.current?.injectJavascript(
        setThoughtCategoryScript(
          categoryPickerIndex,
          category.id,
          categoryLabels.get(category.id)
        )
      );
      if (readOnly) {
        const thought = next[categoryPickerIndex];
        if (thought?.id) {
          onChangeCategory?.({
            id: thought.id,
            categoryId: category.id,
          });
        }
      }
      closeCategorySheet();
      setCategoryPickerIndex(null);
    },
    [
      categoryLabels,
      categoryPickerIndex,
      closeCategorySheet,
      getValues,
      onChangeCategory,
      readOnly,
      setValue,
      splitCategoryPicking,
      mergeCategoryPicking,
    ]
  );

  const backgroundColor = plain ? "transparent" : cardColor;
  const textColor = hsl("text", colorScheme);
  const placeholderColor = mutedFg;
  const errorPlaceholderColor = hsl("foreground-errors", colorScheme);
  const caretColor = hsl("primary", colorScheme);
  const showToolbar = true;
  const toolbarBarHeight = getThoughtsEditorToolbarHeight(toolbarMode);
  const toolbarPad = useSharedValue(toolbarBarHeight);
  React.useEffect(() => {
    toolbarPad.value = withTiming(toolbarBarHeight, {
      duration: TOOLBAR_HEIGHT_ANIMATION_MS,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [toolbarBarHeight, toolbarPad]);
  const editorToolbarPad =
    THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE / 2 +
    Math.max(keyboardHeight, insets.bottom, 6);
  const editorPadStyle = useAnimatedStyle(
    () => ({
      paddingBottom: toolbarPad.value + editorToolbarPad,
    }),
    [editorToolbarPad]
  );

  React.useEffect(() => {
    onToolSessionChange?.(Boolean(splitSide) || merging);
  }, [merging, onToolSessionChange, splitSide]);

  React.useEffect(() => {
    return () => {
      onToolSessionChange?.(false);
    };
  }, [onToolSessionChange]);

  React.useImperativeHandle(
    ref,
    () => ({
      validateRequiredContent: () => {
        const thoughts = getValues("thoughts") ?? [];

        const isEmptyThought = (thought: ThoughtsFormValue) =>
          !stripHtml(thought.title) &&
          !stripHtml(getThoughtPlainText(thought)) &&
          !thought.semanticLabel.trim();

        // Fully empty bullets are dropped on save — ignore them for "has content".
        const contentful = thoughts.filter(
          (thought) => !isEmptyThought(thought)
        );

        if (contentful.length === 0) {
          richRef.current?.injectJavascript(
            setThoughtValidationErrorsScript({
              emptyContent: true,
              incomplete: [],
              messages: validationMessages,
            })
          );
          return false;
        }

        // Titles are optional even when the title fields are visible.
        richRef.current?.injectJavascript(clearThoughtValidationErrorsScript());
        return true;
      },
      clearValidationErrors: () => {
        richRef.current?.injectJavascript(clearThoughtValidationErrorsScript());
      },
      titlesEnabled: () =>
        (getValues("thoughts") ?? []).some(
          (thought) => stripHtml(thought.title).length > 0
        ),
      flushThoughts: () =>
        new Promise<ThoughtsFormValue[]>((resolve) => {
          if (lastHtmlRef.current) {
            syncThoughtsFromHtml(lastHtmlRef.current);
          }
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            pendingHtmlSyncRef.current = null;
            resolve(getValues("thoughts") ?? []);
          };
          const timeout = setTimeout(finish, 250);
          pendingHtmlSyncRef.current = () => {
            clearTimeout(timeout);
            finish();
          };
          richRef.current?.injectJavascript(REQUEST_EDITOR_HTML_SCRIPT);
        }),
      flushPendingNlp,
    }),
    [flushPendingNlp, getValues, syncThoughtsFromHtml, validationMessages]
  );

  return (
    <BottomSheet className="flex-1 min-h-0">
      <CategorySheetPresenter
        open={
          categoryPickerIndex != null ||
          splitCategoryPicking ||
          mergeCategoryPicking
        }
      />
      <View className="relative flex-col flex-1 min-h-0">
        {!readOnly && !plain ? (
          <Label className="mb-0 text-popover-foreground" nativeID="thoughts">
            <ThoughtsEditorContentLabel />
          </Label>
        ) : null}

        {/* Android: clipping/rounding a WebView parent overflows HWUI while drawing. */}
        <View
          className={
            plain
              ? "relative flex-1 min-h-0"
              : Platform.OS === "android"
                ? "relative flex-1 min-h-0 border border-input"
                : "relative flex-1 min-h-0 rounded-lg border border-input"
          }
          style={
            plain
              ? { backgroundColor: "transparent", overflow: "visible" }
              : {
                  backgroundColor: hsl("card", colorScheme),
                  overflow: "visible",
                }
          }
        >
          <Animated.View
            className={
              Platform.OS === "android"
                ? "flex-1 min-h-0"
                : "flex-1 min-h-0 overflow-hidden"
            }
            style={
              showToolbar && dockToolbarToKeyboard ? editorPadStyle : undefined
            }
            onLayout={(event) => {
              scrollViewHeightRef.current = event.nativeEvent.layout.height;
              if (keyboardOpenRef.current) {
                scrollCaretIntoView();
              }
            }}
          >
            {/* Don't load Quicksand via @font-face — Android SIGBUS in FreeType. */}
            <RichEditor
              ref={richRef}
              style={{ flex: 1 }}
              useContainer={false}
              scrollEnabled
              nestedScrollEnabled
              disabled={false}
              pasteAsPlainText
              initialContentHTML={initialHtmlRef.current}
              placeholder=""
              editorInitializedCallback={handleEditorInitialized}
              originWhitelist={["*"]}
              editorStyle={{
                backgroundColor,
                color: textColor,
                caretColor,
                placeholderColor,
                contentCSSText: `
                  font-family: 'QuicksandRegular', sans-serif;
                  font-size: 16px;
                  line-height: 1.45;
                  padding: ${plain ? "8px 0" : "12px"};
                  padding-left: 0;
                  padding-bottom: ${
                    showToolbar && dockToolbarToKeyboard
                      ? CARET_BOTTOM_MARGIN +
                        THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE / 2
                      : !readOnly && keyboardOpen
                        ? CARET_BOTTOM_MARGIN +
                          toolbarBarHeight +
                          THOUGHTS_EDITOR_TOOLBAR_TOGGLE_SIZE / 2
                        : 12
                  }px;
                  min-height: 100%;
                  box-sizing: border-box;
                `,
                cssText: `
                  .mc-thoughts {
                    --mc-gap-compact: 4px;
                    --mc-gap-block: 14px;
                    --mc-gap-type: 8px;
                    --mc-list-indent: 16px;
                    --mc-list-pad: 44px;
                    padding-left: 8px;
                    padding-right: 8px;
                    margin: 0;
                    font-size: 0;
                  }
                  .thought-item {
                    font-size: 16px;
                  }
                  .thought-item:not(.is-inline):not(.is-run-start) {
                    margin-left: -8px;
                    margin-right: -8px;
                  }
                  .pell-content ul,
                  .pell-content ol {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                  }
                  .thought-item {
                    display: block;
                    position: relative;
                    margin-top: var(--mc-gap-compact);
                    margin-bottom: 0;
                    padding-left: var(--mc-list-pad);
                    padding-right: 0;
                    overflow: visible;
                    box-sizing: border-box;
                    --category-stack: 0px;
                    --dot-size: 8px;
                  }
                  .thought-item.is-block {
                    padding-left: 10px;
                  }
                  .thought-item.is-block .thought-rail {
                    display: none;
                  }
                  .thought-item.is-block .thought-body {
                    border-left: 3px solid transparent;
                    padding-left: 8px;
                  }
                  .thought-item.is-collapsed {
                    --category-stack: 0px;
                  }
                  .thought-rail {
                    position: absolute;
                    left: var(--mc-list-indent);
                    top: 0;
                    bottom: 0;
                    width: 22px;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 2;
                  }
                  .thought-check {
                    display: none;
                    position: absolute;
                    z-index: 4;
                    left: var(--mc-list-indent);
                    width: 22px;
                    height: 22px;
                    padding: 0;
                    margin: 0;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    align-items: center;
                    justify-content: center;
                  }
                  .thought-check.is-anchored {
                    transition: none;
                  }
                  .thought-check::before {
                    content: "";
                    position: absolute;
                    top: -2px;
                    right: -8px;
                    bottom: -8px;
                    left: -2px;
                  }
                  .thought-item.is-checklist .thought-check {
                    display: flex;
                    left: var(--mc-list-indent);
                    top: calc(var(--check-nudge, 2px));
                  }
                  .thought-check-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    width: 20px;
                    height: 20px;
                    border: 2px solid ${mutedFg};
                    border-radius: 3px;
                    position: relative;
                    z-index: 1;
                    background: ${surfaceColor};
                  }
                  .thought-check-box svg {
                    display: none;
                    width: 16px;
                    height: 16px;
                    color: ${cardColor};
                  }
                  .thought-item.is-completed .thought-check-box {
                    background: ${mutedFg};
                    border-color: ${mutedFg};
                  }
                  .thought-item.is-completed .thought-check-box svg {
                    display: block;
                  }
                  .thought-item.is-completed .thought-title,
                  .thought-item.is-completed .thought-summary {
                    text-decoration: line-through;
                    opacity: 0.55;
                  }
                  .thought-item.is-completed .thought-title u,
                  .thought-item.is-completed .thought-summary u {
                    text-decoration: underline line-through;
                  }
                  .thought-stripe {
                    position: absolute;
                    left: 50%;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    margin-left: -2px;
                    border-radius: 2px;
                    pointer-events: none;
                    transition: opacity 0.38s ease;
                  }
                  .thought-dot {
                    position: absolute;
                    left: 50%;
                    width: var(--dot-size);
                    height: var(--dot-size);
                    margin-left: calc(var(--dot-size) / -2);
                    border-radius: 999px;
                    background-color: ${mutedFg};
                    top: 6px;
                    z-index: 1;
                  }
                  .thought-dot.is-anchored {
                    transition: none;
                  }
                  .thought-item.is-checklist .thought-dot {
                    display: none;
                  }
                  .thought-body {
                    min-width: 0;
                    max-width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    box-sizing: border-box;
                    padding-right: 0;
                  }
                  .thought-expand {
                    display: none;
                    position: absolute;
                    top: calc(
                      var(--category-stack, 0px) + var(--check-nudge, 2px) - 3px
                    );
                    right: 0;
                    width: 28px;
                    height: 28px;
                    padding: 0;
                    margin: 0;
                    border: none;
                    background: transparent;
                    color: ${mutedFg};
                    align-items: center;
                    justify-content: center;
                    opacity: 0.5;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 3;
                  }
                  .thought-expand.is-anchored {
                    transition:
                      top 0.38s ease,
                      transform 0.28s ease;
                  }
                  html.mc-editing .thought-expand {
                    display: flex;
                  }
                  .thought-expand svg {
                    display: block;
                    pointer-events: none;
                    transition: transform 0.28s ease;
                  }
                  .thought-item:not(.is-collapsed) .thought-expand svg {
                    transform: rotate(180deg);
                  }
                  .thought-graph {
                    position: absolute;
                    top: calc(
                      var(--category-stack, 0px) + var(--check-nudge, 2px) - 5px
                    );
                    right: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${graphButtonColor};
                    background: transparent;
                    opacity: 0.85;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 3;
                  }
                  .thought-graph.is-anchored {
                    transition:
                      top 0.38s ease,
                      opacity 0.16s ease;
                  }
                  .thought-graph.is-pressed,
                  .thought-graph:active {
                    opacity: 0.35;
                  }
                  .thought-graph svg {
                    display: block;
                    pointer-events: none;
                  }
                  .thought-category {
                    position: relative;
                    z-index: 5;
                    display: inline-block;
                    max-width: 100%;
                    width: fit-content;
                    min-height: 18px;
                    margin: 0 0 4px;
                    padding: 2px 0;
                    overflow: visible;
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
                      margin 0.38s ease,
                      min-height 0.38s ease,
                      padding 0.38s ease;
                  }
                  .thought-category::before {
                    content: "";
                    position: absolute;
                    top: -6px;
                    right: -8px;
                    bottom: -6px;
                    left: -8px;
                  }
                  .thought-category-name {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    pointer-events: none;
                  }
                  .thought-fields {
                    min-width: 0;
                  }
                  .thought-item.is-collapsed .thought-category {
                    opacity: 0;
                    height: 0;
                    min-height: 0;
                    margin: 0;
                    padding: 0;
                    pointer-events: none;
                  }
                  .thought-item.is-collapsed .thought-title {
                    opacity: 0;
                    max-height: 0;
                    min-height: 0;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    pointer-events: none;
                  }
                  .thought-item.is-collapsed .thought-title.is-placeholder::before,
                  .thought-item.is-collapsed .thought-title.is-error-placeholder::before {
                    content: none;
                  }
                  .thought-item.is-collapsed .thought-stripe {
                    opacity: 0;
                    pointer-events: none;
                  }
                  @keyframes thought-dot-pulse {
                    0%,
                    100% {
                      transform: scale(1);
                      opacity: 1;
                    }
                    50% {
                      transform: scale(1.22);
                      opacity: 0.4;
                    }
                  }
                  .thought-dot.is-bouncing {
                    animation: thought-dot-pulse 0.56s ease-in-out 3;
                  }
                  .thought-title,
                  .thought-summary {
                    position: relative;
                    display: inline;
                    padding: 0;
                    border-radius: 2px;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    -webkit-box-decoration-break: clone;
                    box-decoration-break: clone;
                  }
                  .thought-summary div,
                  .thought-summary p,
                  .thought-title div,
                  .thought-title p {
                    display: inline;
                  }
                  .thought-title::selection,
                  .thought-title *::selection,
                  .thought-summary::selection,
                  .thought-summary *::selection {
                    background-color: rgba(90, 90, 90, 0.38);
                  }
                  .thought-title.is-placeholder,
                  .thought-summary.is-placeholder {
                    display: block;
                    width: 100%;
                    padding: 0;
                    min-height: 1.35em;
                    background-color: transparent;
                    overflow-wrap: normal;
                    word-break: normal;
                  }
                  html {
                    --mc-cat-wash: 18%;
                    --mc-cat-wash-selected: 34%;
                    --mc-cat-wash-plain: 6%;
                    --mc-cat-wash-plain-selected: 16%;
                  }
                  html.mc-show-categories .thought-title,
                  html.mc-show-categories .thought-summary {
                    -webkit-box-decoration-break: slice;
                    box-decoration-break: slice;
                  }
                  html.mc-show-categories .thought-title:not(.is-placeholder),
                  html.mc-show-categories .thought-summary:not(.is-placeholder) {
                    background-color: color-mix(in srgb, ${mutedFg} var(--mc-cat-wash-plain, 6%), transparent);
                    padding: 0;
                    margin: 0;
                    border: none;
                    border-radius: 0;
                    line-height: inherit;
                  }
                  .thought-title {
                    font-weight: 700;
                    margin-bottom: 2px;
                    opacity: 0.75;
                    overflow: hidden;
                    transition:
                      max-height 0.38s ease,
                      opacity 0.28s ease,
                      min-height 0.38s ease,
                      margin 0.38s ease,
                      padding 0.38s ease;
                  }
                  html:not(.mc-editing) .thought-item:not(.has-entered-title) .thought-title {
                    max-height: 0 !important;
                    min-height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    opacity: 0 !important;
                    overflow: hidden !important;
                    pointer-events: none !important;
                    transition: none !important;
                  }
                  html:not(.mc-editing) .thought-item:not(.has-entered-title) .thought-title::before {
                    content: none !important;
                  }
                  .thought-title * {
                    font-weight: 700;
                  }
                  .thought-summary {
                    font-weight: 400;
                    opacity: 0.92;
                  }
                  .thought-title b,
                  .thought-title strong,
                  .thought-summary b,
                  .thought-summary strong {
                    font-weight: 700;
                  }
                  .thought-title i,
                  .thought-title em,
                  .thought-summary i,
                  .thought-summary em {
                    font-style: italic;
                  }
                  .thought-title u,
                  .thought-summary u {
                    text-decoration: underline;
                  }
                  /* Class-driven placeholders survive backspace better than :empty */
                  .thought-title.is-placeholder::before,
                  .thought-summary.is-placeholder::before {
                    content: attr(data-placeholder);
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: max-content;
                    max-width: 100%;
                    white-space: nowrap;
                    color: ${placeholderColor};
                    pointer-events: none;
                    font-family: inherit;
                    font-weight: inherit;
                  }
                  .thought-title.is-error-placeholder::before,
                  .thought-summary.is-error-placeholder::before {
                    content: attr(data-placeholder);
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: max-content;
                    max-width: 100%;
                    white-space: nowrap;
                    color: ${errorPlaceholderColor};
                    pointer-events: none;
                    font-family: inherit;
                    font-weight: inherit;
                  }
                  .thought-stripe,
                  .thought-category,
                  .thought-expand,
                  .thought-graph {
                    display: none !important;
                  }
                  .thought-rail {
                    pointer-events: none;
                    cursor: default;
                  }
                  .thought-title {
                    display: none !important;
                  }
                  html.mc-editing .thought-expand,
                  html.mc-editing .thought-graph {
                    display: none !important;
                  }
                  html.mc-details-lock .pell-content,
                  .pell-content.mc-details-lock,
                  html.mc-merging .pell-content,
                  html.mc-merging .pell-content * {
                    caret-color: transparent;
                    user-select: none;
                    -webkit-user-select: none;
                  }
                  .thought-item {
                    padding-left: var(--mc-list-pad);
                    padding-right: 8px;
                    --category-stack: 0px;
                  }
                  .thought-body,
                  .thought-item.has-graph .thought-body,
                  .thought-item:has(> .thought-graph) .thought-body,
                  html.mc-editing .thought-item:has(> .thought-expand) .thought-body {
                    padding-right: 0 !important;
                  }
                  .thought-item.is-block {
                    padding-left: 8px;
                  }
                  .thought-item.is-block .thought-rail,
                  .thought-item.is-block .thought-dot,
                  .thought-item.is-block .thought-check {
                    display: none !important;
                  }
                  .thought-item.is-block .thought-body {
                    border-left: none;
                    padding-left: 0;
                  }
                  .thought-item.is-checklist {
                    padding-left: var(--mc-list-pad);
                  }
                  .thought-item.is-checklist .thought-dot {
                    display: none !important;
                  }
                  .thought-item.is-checklist .thought-check {
                    left: var(--mc-list-indent);
                    top: calc(var(--check-nudge, 2px));
                  }
                  .thought-fields {
                    display: inline-block;
                    width: fit-content;
                    max-width: 100%;
                    min-width: 0;
                    vertical-align: top;
                  }
                  .thought-fields:has(.is-placeholder),
                  .thought-fields:has(.is-error-placeholder) {
                    width: 100%;
                  }
                  .thought-item.is-inline,
                  .thought-item.is-run-start,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) {
                    display: inline;
                    padding-left: 0;
                    padding-right: 0;
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-left: 0;
                    margin-right: 0;
                    vertical-align: baseline;
                    font-size: 0;
                  }
                  .thought-item.is-inline + .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline)::before {
                    content: "\\A";
                    white-space: pre;
                  }
                  .thought-item:not(.is-inline):has(+ .thought-item[data-thought-type="text"]:not(.is-inline) + .thought-item.is-inline) {
                    margin-bottom: var(--mc-gap-block);
                  }
                  .thought-item.is-block:not(.is-inline):not(.is-run-start):not(:has(+ .thought-item.is-inline)),
                  .thought-item[data-thought-type="text"]:not(.is-inline):not(.is-run-start):not(:has(+ .thought-item.is-inline)) {
                    margin-top: var(--mc-gap-block);
                  }
                  .thought-item[data-thought-type="text"]:not(.is-inline)
                    + .thought-item:not(.is-inline) {
                    margin-top: var(--mc-gap-block);
                  }
                  .thought-item[data-thought-type="li"] + .thought-item.is-checklist,
                  .thought-item.is-checklist + .thought-item[data-thought-type="li"] {
                    margin-top: var(--mc-gap-type);
                  }
                  .thought-item.is-checklist:has(+ .thought-item[data-thought-type="text"]),
                  .thought-item[data-thought-type="li"]:has(+ .thought-item[data-thought-type="text"]) {
                    margin-bottom: var(--mc-gap-block);
                  }
                  .thought-item.is-inline + .thought-item:not(.is-inline) {
                    margin-top: var(--mc-gap-block);
                  }
                  .mc-thoughts > .thought-item:first-child {
                    margin-top: 0;
                  }
                  .mc-thoughts:has(> .thought-item.is-inline:last-child)::after {
                    content: "";
                    display: block;
                    height: var(--mc-gap-block);
                  }
                  .thought-item.is-inline .thought-category,
                  .thought-item.is-run-start .thought-category,
                  .thought-item.is-inline .thought-graph,
                  .thought-item.is-run-start .thought-graph,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-category,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-graph {
                    display: none !important;
                  }
                  .thought-item.is-inline .thought-rail,
                  .thought-item.is-inline .thought-dot,
                  .thought-item.is-inline .thought-check,
                  .thought-item.is-run-start .thought-rail,
                  .thought-item.is-run-start .thought-dot,
                  .thought-item.is-run-start .thought-check,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-rail,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-dot,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-check {
                    display: none !important;
                  }
                  .thought-item.is-inline .thought-body,
                  .thought-item.is-inline .thought-fields,
                  .thought-item.is-run-start .thought-body,
                  .thought-item.is-run-start .thought-fields,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-body,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-fields {
                    display: inline;
                    width: auto;
                    max-width: none;
                    min-width: 0;
                    vertical-align: baseline;
                    border-left: none;
                    padding-left: 0;
                    padding-right: 0;
                  }
                  .thought-item.is-inline .thought-summary,
                  .thought-item.is-inline .thought-title,
                  .thought-item.is-run-start .thought-summary,
                  .thought-item.is-run-start .thought-title,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-summary,
                  .thought-item[data-thought-type="text"]:not(.is-inline):has(+ .thought-item.is-inline) .thought-title {
                    display: inline;
                    overflow: visible;
                    margin: 0;
                    padding: 0;
                    font-size: 16px;
                  }
                  html.mc-show-categories .thought-item.is-selected .thought-summary:not(.is-placeholder),
                  html.mc-show-categories .thought-item.is-selected .thought-title:not(.is-placeholder) {
                    background-color: color-mix(in srgb, ${mutedFg} var(--mc-cat-wash-plain-selected, 16%), transparent);
                    padding: 0;
                    margin: 0;
                    border: none;
                    border-radius: 0;
                    line-height: inherit;
                  }
                  html.mc-show-categories .thought-item.is-selected .thought-summary.is-placeholder,
                  html.mc-show-categories .thought-item.is-selected .thought-title.is-placeholder {
                    background-color: color-mix(in srgb, ${mutedFg} var(--mc-cat-wash-plain-selected, 16%), transparent);
                    padding: 0;
                    margin: 0;
                    border: none;
                    border-radius: 0;
                    line-height: inherit;
                  }
                  html.mc-merging .thought-item.is-merge-selected .thought-summary:not(.is-placeholder),
                  html.mc-merging .thought-item.is-merge-selected .thought-title:not(.is-placeholder) {
                    background-color: color-mix(in srgb, ${caretColor} 28%, transparent);
                    border-radius: 3px;
                  }
                  html.mc-merging .thought-item.is-merge-selected .thought-summary.is-placeholder,
                  html.mc-merging .thought-item.is-merge-selected .thought-title.is-placeholder {
                    background-color: color-mix(in srgb, ${caretColor} 28%, transparent);
                    border-radius: 4px;
                  }
                  ${categoryColorsCss}
                `,
              }}
              onChange={
                readOnly || merging
                  ? undefined
                  : (html) => {
                      syncThoughtsFromHtml(html);
                      if (keyboardOpenRef.current) {
                        scrollCaretIntoView();
                      }
                    }
              }
              onCursorPosition={
                readOnly || merging
                  ? undefined
                  : () => {
                      tryApplyPendingFormat();
                      scrollCaretIntoView();
                    }
              }
              onMessage={handleEditorMessage}
            />
          </Animated.View>
          {showToolbar && !dockToolbarToKeyboard ? (
            <ThoughtsEditorToolbar
              mode={toolbarMode}
              onModeChange={handleToolbarModeChange}
              activeFormats={activeFormats}
              onFormat={handleFormat}
              thoughtType={caretThoughtType}
              onThoughtTypeChange={handleThoughtType}
              selectedTitle={selectedTitleText}
              selectedCategoryLabel={toolbarCategoryLabel}
              selectedCategoryColor={toolbarCategoryColor}
              hasSelectedThought={selectedThought != null}
              onEditTitle={handleEditTitle}
              onOpenCategory={handleOpenSelectedCategory}
              onOpenGraph={handleOpenSelectedGraph}
              categoriesHidden={hideCategories}
              categoryOpacity={categoryOpacity}
              onToggleCategories={handleToggleCategories}
              onCategoryOpacityChange={handleCategoryOpacityChange}
              splitSide={splitSide}
              onSplit={handleSplit}
              onSplitSide={handleSplitSide}
              onConfirmSplit={handleConfirmSplit}
              onCancelSplit={handleCancelSplit}
              merging={merging}
              mergeCanConfirm={mergeCanConfirm}
              onMerge={handleMerge}
              onConfirmMerge={handleConfirmMerge}
              onCancelMerge={handleCancelMerge}
            />
          ) : null}
        </View>
        {showToolbar && dockToolbarToKeyboard ? (
          <ThoughtsEditorToolbar
            dockToKeyboard
            mode={toolbarMode}
            onModeChange={handleToolbarModeChange}
            activeFormats={activeFormats}
            onFormat={handleFormat}
            thoughtType={caretThoughtType}
            onThoughtTypeChange={handleThoughtType}
            selectedTitle={selectedTitleText}
            selectedCategoryLabel={toolbarCategoryLabel}
            selectedCategoryColor={toolbarCategoryColor}
            hasSelectedThought={selectedThought != null}
            onEditTitle={handleEditTitle}
            onOpenCategory={handleOpenSelectedCategory}
            onOpenGraph={handleOpenSelectedGraph}
            categoriesHidden={hideCategories}
            categoryOpacity={categoryOpacity}
            onToggleCategories={handleToggleCategories}
            onCategoryOpacityChange={handleCategoryOpacityChange}
            splitSide={splitSide}
            onSplit={handleSplit}
            onSplitSide={handleSplitSide}
            onConfirmSplit={handleConfirmSplit}
            onCancelSplit={handleCancelSplit}
            merging={merging}
            mergeCanConfirm={mergeCanConfirm}
            onMerge={handleMerge}
            onConfirmMerge={handleConfirmMerge}
            onCancelMerge={handleCancelMerge}
          />
        ) : null}
      </View>

      <BottomSheetContent
        ref={categorySheetRef}
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        onDismiss={() => {
          setCategoryPickerIndex(null);
          setSplitCategoryPicking(false);
          setMergeCategoryPicking(false);
        }}
      >
        <BottomSheetView className="gap-5 pt-6 bg-background">
          <BottomSheetHeader className="bg-background">
            <View className="flex-row items-center gap-2">
              <Icon name="shapes" color="foreground" size={18} />
              <Typography variant="h3">Categories</Typography>
            </View>
          </BottomSheetHeader>
          <ScrollView style={{ maxHeight: 400 }}>
            <View className="flex flex-col w-full flex-wrap gap-2 pb-6">
              {categories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  item={category}
                  label={categoryLabels.get(category.id) ?? category.name}
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

export const ThoughtsEditor = React.forwardRef(
  ThoughtsEditorInner
) as React.ForwardRefExoticComponent<
  ThoughtsEditorProps & React.RefAttributes<ThoughtsEditorHandle>
>;
ThoughtsEditor.displayName = "ThoughtsEditor";
