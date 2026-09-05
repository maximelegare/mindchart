import { Category } from "@repo/zod-schemas";
import { Asset } from "expo-asset";
import React from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
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
import { type ThoughtsEditorFormValues } from "./types";
import {
  htmlToThoughts,
  setThoughtCategoryScript,
  stripHtml,
  thoughtsToHtml,
} from "./thoughtsHtml";
import {
  BULLET_EDITOR_GUARD_SCRIPT,
  CATEGORY_COLLAPSE_SCRIPT,
  CHECKLIST_SCRIPT,
  GRAPH_BUTTON_CLICK_SCRIPT,
  REFRESH_CATEGORY_TIMERS_SCRIPT,
  SYNC_CHECKLIST_LAYOUT_SCRIPT,
  clearThoughtValidationErrorsScript,
  setEditingModeScript,
  setShowTitlesScript,
  setSimplifiedModeScript,
  setThoughtListTypeScript,
  setThoughtValidationErrorsScript,
} from "./bulletEditorScript";
import {
  ThoughtsEditorContentLabel,
  buildThoughtPlaceholdersScript,
  getThoughtFieldPlaceholders,
} from "./thoughtsEditorLabels";
import {
  ThoughtsEditorToolbar,
  THOUGHTS_EDITOR_TOOLBAR_HEIGHT,
} from "./thoughtsEditorToolbar";
import { useCategoryLabelsMap } from "@/features/categories/hooks/useCategoryLabels";

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

/** Extra space below the caret so it stays clear of the format toolbar / keyboard. */
const CARET_BOTTOM_MARGIN = 72;

const scrollCaretIntoViewScript = (bottomMargin: number) => `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;

  var sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return true;

  var range = sel.getRangeAt(0).cloneRange();
  var rect = range.getClientRects()[0];
  if (!rect || (rect.height === 0 && rect.width === 0)) {
    rect = range.getBoundingClientRect();
  }

  var margin = ${Math.max(24, Math.floor(bottomMargin))};
  var contentRect = content.getBoundingClientRect();

  if (!rect || (rect.height === 0 && rect.width === 0)) {
    var node = sel.anchorNode;
    var el = node && (node.nodeType === 3 ? node.parentElement : node);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ block: "center", inline: "nearest" });
    }
    return true;
  }

  var caretTop = rect.top - contentRect.top + content.scrollTop;
  var caretBottom = rect.bottom - contentRect.top + content.scrollTop;
  var visibleTop = content.scrollTop + 8;
  var visibleBottom = content.scrollTop + content.clientHeight - margin;

  if (caretBottom > visibleBottom) {
    content.scrollTop = Math.max(0, caretBottom - content.clientHeight + margin);
  } else if (caretTop < visibleTop) {
    content.scrollTop = Math.max(0, caretTop - 8);
  }
  return true;
})();
`;

function buildCategoryColorCss(categories: Category[]): string {
  return categories
    .map(
      (category) => `
      li[data-category-id="${category.id}"] .thought-stripe,
      li[data-category-id="${category.id}"] .thought-dot {
        background-color: ${category.color};
      }
      li[data-category-id="${category.id}"] .thought-check-box {
        border-color: ${category.color};
      }
      li[data-category-id="${category.id}"].is-completed .thought-check-box {
        background-color: ${category.color};
        border-color: ${category.color};
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
function CategorySheetPresenter({ index }: { index: number | null }) {
  const { sheetRef } = useBottomSheetContext();

  React.useEffect(() => {
    if (index == null) return;
    Keyboard.dismiss();
    const timer = setTimeout(() => {
      Keyboard.dismiss();
      sheetRef.current?.present();
    }, 40);
    return () => clearTimeout(timer);
  }, [index, sheetRef]);

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
  /** Persist completion when the checkbox is toggled in view mode. */
  onToggleCompleted?: (thought: { id: string; isCompleted: boolean }) => void;
  /** Persist category when it is changed in view mode. */
  onChangeCategory?: (thought: { id: string; categoryId: string }) => void;
};

export type ThoughtsEditorHandle = {
  /** Returns true when thoughts are valid to save. Applies red placeholders when not. */
  validateRequiredContent: () => boolean;
  clearValidationErrors: () => void;
};

function ThoughtsEditorInner(
  {
    noteId,
    categories,
    defaultShowTitles = false,
    readOnly = false,
    showGraphButtons = false,
    plain = false,
    simplified = false,
    dockToolbarToKeyboard = false,
    onToggleCompleted,
    onChangeCategory,
  }: ThoughtsEditorProps,
  ref: React.ForwardedRef<ThoughtsEditorHandle>
) {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const categoryLabels = useCategoryLabelsMap();
  const { push } = useRouter();
  const { getValues, setValue, watch } =
    useFormContext<ThoughtsEditorFormValues>();
  // Static simplified chrome only applies in the view editor.
  const effectiveSimplified = simplified && readOnly;
  // Keep the user's Titles preference even while simplified view hides them.
  const [showTitles, setShowTitles] = React.useState(defaultShowTitles);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [activeFormats, setActiveFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [caretIsChecklist, setCaretIsChecklist] = React.useState(() =>
    Boolean(getValues("thoughts")?.[0]?.isCompletable)
  );
  const [fontFaceCss, setFontFaceCss] = React.useState<string | null>(null);
  const [categoryPickerIndex, setCategoryPickerIndex] = React.useState<
    number | null
  >(null);

  const richRef = React.useRef<RichEditor>(null);
  const scrollViewHeightRef = React.useRef(0);
  const keyboardOpenRef = React.useRef(false);
  const pendingFormatRef = React.useRef<"bold" | "italic" | "underline" | null>(
    null
  );
  const showTitlesRef = React.useRef(showTitles);
  const effectiveShowTitles = effectiveSimplified ? false : showTitles;
  showTitlesRef.current = effectiveShowTitles;
  const simplifiedRef = React.useRef(effectiveSimplified);
  simplifiedRef.current = effectiveSimplified;
  const borderColorRef = React.useRef(hsl("border", colorScheme));
  borderColorRef.current = hsl("border", colorScheme);
  const surfaceColorRef = React.useRef(
    plain ? hsl("background", colorScheme) : hsl("card", colorScheme)
  );
  surfaceColorRef.current = plain
    ? hsl("background", colorScheme)
    : hsl("card", colorScheme);
  const thoughtPlaceholders = React.useMemo(
    () => getThoughtFieldPlaceholders(),
    []
  );
  const htmlOptions = React.useMemo(
    () => ({
      showGraphButtons,
      placeholders: {
        title: thoughtPlaceholders.title,
        summary: thoughtPlaceholders.summary,
        bullet: thoughtPlaceholders.bullet,
      },
    }),
    [showGraphButtons, thoughtPlaceholders]
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
    thoughtsToHtml(getValues("thoughts"), effectiveShowTitles, htmlOptions)
  );
  const categoryColorsCss = React.useMemo(
    () => buildCategoryColorCss(categories),
    [categories]
  );
  const categoryColorsCssRef = React.useRef(categoryColorsCss);
  categoryColorsCssRef.current = categoryColorsCss;
  const { ref: categorySheetRef, close: closeCategorySheet } = useBottomSheet();

  const thoughts = watch("thoughts");
  const selectedCategoryId =
    categoryPickerIndex != null
      ? (thoughts?.[categoryPickerIndex]?.categoryId ?? "uncategorized")
      : null;

  const scrollCaretIntoView = React.useCallback(() => {
    const margin = keyboardOpenRef.current ? CARET_BOTTOM_MARGIN : 28;
    richRef.current?.injectJavascript(scrollCaretIntoViewScript(margin));
  }, []);

  const tryApplyPendingFormat = React.useCallback(() => {
    const pending = pendingFormatRef.current;
    if (!pending) return;
    richRef.current?.injectJavascript(applyFormatInThoughtFieldScript(pending));
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
      if (!dockToolbarToKeyboard) {
        setKeyboardOpen(true);
      }

      const refresh = () => {
        tryApplyPendingFormat();
        scrollCaretIntoView();
      };
      requestAnimationFrame(() => {
        requestAnimationFrame(refresh);
      });
      setTimeout(refresh, 100);
      setTimeout(refresh, 280);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardOpenRef.current = false;
      pendingFormatRef.current = null;
      if (!dockToolbarToKeyboard) {
        setKeyboardOpen(false);
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [
    readOnly,
    dockToolbarToKeyboard,
    scrollCaretIntoView,
    tryApplyPendingFormat,
  ]);

  React.useEffect(() => {
    if (readOnly || !dockToolbarToKeyboard) return;
    const pad = CARET_BOTTOM_MARGIN + THOUGHTS_EDITOR_TOOLBAR_HEIGHT;
    richRef.current?.injectJavascript(`
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) content.style.paddingBottom = "${pad}px";
  true;
})();
`);
  }, [readOnly, dockToolbarToKeyboard, fontFaceCss]);

  React.useEffect(() => {
    if (readOnly || !keyboardOpen || dockToolbarToKeyboard) return;
    const pad = CARET_BOTTOM_MARGIN + THOUGHTS_EDITOR_TOOLBAR_HEIGHT;
    richRef.current?.injectJavascript(`
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) content.style.paddingBottom = "${pad}px";
  true;
})();
`);
    scrollCaretIntoView();
  }, [keyboardOpen, readOnly, dockToolbarToKeyboard, scrollCaretIntoView]);

  React.useEffect(() => {
    if (readOnly || keyboardOpen || dockToolbarToKeyboard) return;
    richRef.current?.injectJavascript(`
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (content) content.style.paddingBottom = "12px";
  true;
})();
`);
  }, [keyboardOpen, readOnly, dockToolbarToKeyboard]);

  const applyEditorFlags = React.useCallback(
    (nextShowTitles: boolean) => {
      richRef.current?.injectJavascript(setShowTitlesScript(nextShowTitles));
      richRef.current?.injectJavascript(setEditingModeScript(!readOnly));
    },
    [readOnly]
  );

  const applyCategoryColors = React.useCallback((css: string) => {
    if (!css) return;
    richRef.current?.injectJavascript(setCategoryColorCssScript(css));
  }, []);

  React.useEffect(() => {
    applyCategoryColors(categoryColorsCss);
  }, [applyCategoryColors, categoryColorsCss, fontFaceCss]);

  const applySimplifiedMode = React.useCallback((nextSimplified: boolean) => {
    richRef.current?.injectJavascript(
      setSimplifiedModeScript(
        nextSimplified,
        borderColorRef.current,
        surfaceColorRef.current
      )
    );
  }, []);

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
      setActiveFormats({
        bold: has(actions.setBold),
        italic: has(actions.setItalic),
        underline: has(actions.setUnderline),
      });
    },
    []
  );

  const handleEditorInitialized = React.useCallback(() => {
    // Apply simplified before collapse timers so plain bullets never animate.
    applyEditorFlags(showTitlesRef.current);
    applySimplifiedMode(simplifiedRef.current);
    applyCategoryColors(categoryColorsCssRef.current);
    richRef.current?.registerToolbar((items) => {
      applyPendingFormat(items);
    });
    if (readOnly) {
      richRef.current?.injectJavascript(CATEGORY_COLLAPSE_SCRIPT);
    } else {
      richRef.current?.injectJavascript(
        buildThoughtPlaceholdersScript(thoughtPlaceholders)
      );
      richRef.current?.injectJavascript(BULLET_EDITOR_GUARD_SCRIPT);
    }
    if (showGraphButtons) {
      richRef.current?.injectJavascript(GRAPH_BUTTON_CLICK_SCRIPT);
    }
    richRef.current?.injectJavascript(CHECKLIST_SCRIPT);
    requestAnimationFrame(() => {
      richRef.current?.injectJavascript(REFRESH_CATEGORY_TIMERS_SCRIPT);
      richRef.current?.injectJavascript(SYNC_CHECKLIST_LAYOUT_SCRIPT);
    });
  }, [
    applyEditorFlags,
    applySimplifiedMode,
    applyCategoryColors,
    applyPendingFormat,
    readOnly,
    showGraphButtons,
    thoughtPlaceholders,
  ]);

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
      richRef.current?.injectJavascript(CHECKLIST_SCRIPT);
      richRef.current?.injectJavascript(SYNC_CHECKLIST_LAYOUT_SCRIPT);
    });
  }, []);

  const wasEditingRef = React.useRef(!readOnly);

  // Entering edit installs the guard and drops graph chrome. Leaving edit
  // rebuilds HTML so graph buttons come back.
  React.useEffect(() => {
    if (!readOnly) {
      wasEditingRef.current = true;
      applyEditorFlags(showTitles);
      applySimplifiedMode(false);
      richRef.current?.injectJavascript(
        buildThoughtPlaceholdersScript(thoughtPlaceholders)
      );
      richRef.current?.injectJavascript(BULLET_EDITOR_GUARD_SCRIPT);
      const nextThoughts = getValues("thoughts");
      setCaretIsChecklist(Boolean(nextThoughts?.[0]?.isCompletable));
      richRef.current?.setContentHTML(
        thoughtsToHtml(nextThoughts, showTitles, htmlOptions)
      );
      refreshCategoryTimers();
      return;
    }

    if (!wasEditingRef.current) return;
    wasEditingRef.current = false;

    const titles = simplifiedRef.current ? false : showTitlesRef.current;
    applyEditorFlags(titles);
    applySimplifiedMode(simplifiedRef.current);
    const nextThoughts = getValues("thoughts");
    setCaretIsChecklist(Boolean(nextThoughts?.[0]?.isCompletable));
    richRef.current?.setContentHTML(
      thoughtsToHtml(nextThoughts, titles, htmlOptions)
    );
    richRef.current?.injectJavascript(CATEGORY_COLLAPSE_SCRIPT);
    if (showGraphButtons) {
      richRef.current?.injectJavascript(GRAPH_BUTTON_CLICK_SCRIPT);
    }
    applyCategoryColors(categoryColorsCssRef.current);
    refreshCategoryTimers();
  }, [
    applyCategoryColors,
    applyEditorFlags,
    applySimplifiedMode,
    getValues,
    htmlOptions,
    readOnly,
    refreshCategoryTimers,
    showGraphButtons,
    showTitles,
    thoughtPlaceholders,
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

  const handleListType = React.useCallback((completable: boolean) => {
    setCaretIsChecklist(completable);
    richRef.current?.injectJavascript(setThoughtListTypeScript(completable));
  }, []);

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
        thoughtsToHtml(nextThoughts, nextShowTitles, htmlOptions)
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
      // Hide titles in the WebView only — keep form title fields and showTitles state.
      showTitlesRef.current = false;
      applyEditorFlags(false);
      richRef.current?.setContentHTML(
        thoughtsToHtml(getValues("thoughts"), false, htmlOptions)
      );
      refreshCategoryTimers();
      applySimplifiedMode(true);
      return;
    }

    showTitlesRef.current = showTitles;
    applyEditorFlags(showTitles);
    richRef.current?.setContentHTML(
      thoughtsToHtml(getValues("thoughts"), showTitles, htmlOptions)
    );
    refreshCategoryTimers();
    applySimplifiedMode(false);
    if (showGraphButtons) {
      richRef.current?.injectJavascript(GRAPH_BUTTON_CLICK_SCRIPT);
    }
  }, [
    applyEditorFlags,
    applySimplifiedMode,
    effectiveSimplified,
    getValues,
    htmlOptions,
    refreshCategoryTimers,
    showGraphButtons,
    showTitles,
  ]);

  const handleEditorMessage = React.useCallback(
    (message: { type: string; data?: unknown }) => {
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
        const completable = Boolean(
          (message.data as { completable?: boolean } | undefined)?.completable
        );
        setCaretIsChecklist(completable);
        return;
      }
      if (message.type === "LIST_TYPE") {
        const payload = message.data as
          | { index?: number; completable?: boolean }
          | undefined;
        const index = Number(payload?.index);
        const completable = Boolean(payload?.completable);
        if (!Number.isFinite(index) || index < 0) return;
        setCaretIsChecklist(completable);
        const previous = getValues("thoughts");
        const current = previous[index];
        if (!current) return;
        setValue(
          "thoughts",
          previous.map((thought, thoughtIndex) =>
            thoughtIndex === index
              ? {
                  ...thought,
                  isCompletable: completable,
                  isCompleted: completable ? thought.isCompleted : false,
                }
              : thought
          ),
          { shouldDirty: true }
        );
        return;
      }
      if (message.type === "TOGGLE_COMPLETED") {
        const payload = message.data as
          | { index?: number; completed?: boolean }
          | undefined;
        const index = Number(payload?.index);
        const completed = Boolean(payload?.completed);
        if (!Number.isFinite(index) || index < 0) return;
        const previous = getValues("thoughts");
        const current = previous[index];
        if (!current) return;
        const nextThought = {
          ...current,
          isCompletable: true,
          isCompleted: completed,
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
      if (message.type !== "SELECT_CATEGORY") return;
      const index = Number(message.data);
      if (!Number.isFinite(index) || index < 0) return;
      richRef.current?.dismissKeyboard();
      Keyboard.dismiss();
      setCategoryPickerIndex(index);
    },
    [getValues, onToggleCompleted, push, readOnly, setValue]
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
      setValue("thoughts", next, { shouldDirty: !readOnly });
      richRef.current?.injectJavascript(
        setThoughtCategoryScript(categoryPickerIndex, category.id)
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
      categoryPickerIndex,
      closeCategorySheet,
      getValues,
      onChangeCategory,
      readOnly,
      setValue,
    ]
  );

  const backgroundColor = plain ? "transparent" : hsl("card", colorScheme);
  const textColor = hsl("text", colorScheme);
  const placeholderColor = hsl("muted-foreground", colorScheme);
  const errorPlaceholderColor = hsl("foreground-errors", colorScheme);
  const caretColor = hsl("primary", colorScheme);
  const mutedFg = hsl("muted-foreground", colorScheme);
  const graphButtonColor = mutedFg;
  const graphButtonFill = hsl("primary", colorScheme).replace(
    /^hsl\((.*)\)$/,
    "hsla($1, 0.16)"
  );
  const showToolbar = !readOnly;

  React.useImperativeHandle(
    ref,
    () => ({
      validateRequiredContent: () => {
        const thoughts = getValues("thoughts") ?? [];
        const showTitles = showTitlesRef.current;

        const isEmptyThought = (thought: {
          title: string;
          summary: string;
          semanticLabel: string;
        }) =>
          !stripHtml(thought.title) &&
          !stripHtml(thought.summary) &&
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

        if (showTitles) {
          // Partial bullets (title XOR summary) must be completed.
          const incomplete = thoughts.flatMap((thought, index) => {
            if (isEmptyThought(thought)) return [];
            const hasTitle = Boolean(stripHtml(thought.title));
            const hasSummary = Boolean(stripHtml(thought.summary));
            if (hasTitle && hasSummary) return [];
            return [
              {
                index,
                missingTitle: !hasTitle,
                missingSummary: !hasSummary,
              },
            ];
          });

          if (incomplete.length > 0) {
            richRef.current?.injectJavascript(
              setThoughtValidationErrorsScript({
                emptyContent: false,
                incomplete,
                messages: validationMessages,
              })
            );
            return false;
          }
        }

        richRef.current?.injectJavascript(clearThoughtValidationErrorsScript());
        return true;
      },
      clearValidationErrors: () => {
        richRef.current?.injectJavascript(clearThoughtValidationErrorsScript());
      },
    }),
    [getValues, validationMessages]
  );

  return (
    <BottomSheet className="flex-1 min-h-0">
      <CategorySheetPresenter index={categoryPickerIndex} />
      <View className="relative flex-col flex-1 min-h-0">
        {!readOnly && !plain ? (
          <Label className="mb-0 text-popover-foreground" nativeID="thoughts">
            <ThoughtsEditorContentLabel />
          </Label>
        ) : null}

        <View
          className={
            plain
              ? "relative flex-1 min-h-0 overflow-hidden"
              : "relative flex-1 min-h-0 overflow-hidden rounded-lg border border-input"
          }
          style={
            plain
              ? { backgroundColor: "transparent" }
              : { backgroundColor: hsl("card", colorScheme) }
          }
        >
          <View
            className="flex-1 min-h-0"
            style={
              showToolbar && dockToolbarToKeyboard
                ? {
                    paddingBottom:
                      THOUGHTS_EDITOR_TOOLBAR_HEIGHT +
                      Math.max(insets.bottom, 6),
                  }
                : undefined
            }
            onLayout={(event) => {
              scrollViewHeightRef.current = event.nativeEvent.layout.height;
              if (keyboardOpenRef.current) {
                scrollCaretIntoView();
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
                  padding: ${plain ? (!readOnly ? "8px 0" : "8px 2px") : "12px"};
                  padding-left: 0;
                  padding-bottom: ${
                    showToolbar && dockToolbarToKeyboard
                      ? THOUGHTS_EDITOR_TOOLBAR_HEIGHT + 12
                      : !readOnly && keyboardOpen
                        ? CARET_BOTTOM_MARGIN + THOUGHTS_EDITOR_TOOLBAR_HEIGHT
                        : 12
                  }px;
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
                    padding-left: 30px;
                    padding-right: 0;
                    overflow: visible;
                    box-sizing: border-box;
                    --category-stack: 25px;
                    --dot-size: 8px;
                  }
                  li.thought-item.is-collapsed {
                    --category-stack: 2px;
                  }
                  .thought-rail {
                    position: absolute;
                    left: 6px;
                    top: 0;
                    bottom: 0;
                    width: 18px;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    z-index: 2;
                  }
                  .thought-check {
                    display: none;
                    position: absolute;
                    z-index: 4;
                    left: 4px;
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
                    transition: top 0.38s ease;
                  }
                  .thought-check::before {
                    content: "";
                    position: absolute;
                    top: -2px;
                    right: -8px;
                    bottom: -8px;
                    left: -2px;
                  }
                  li.thought-item.is-checklist .thought-check {
                    display: flex;
                    left: 4px;
                    top: calc(var(--category-stack, 0px) + var(--check-nudge, 2px) - 2px);
                  }
                  .thought-check-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    width: 20px;
                    height: 20px;
                    border: 2px solid currentColor;
                    border-radius: 3px;
                    position: relative;
                    z-index: 1;
                    background: ${plain ? hsl("background", colorScheme) : backgroundColor};
                  }
                  .thought-check-box svg {
                    display: none;
                    width: 16px;
                    height: 16px;
                    color: ${hsl("popover", colorScheme)};
                  }
                  li.thought-item.is-completed .thought-check-box {
                    background: currentColor;
                  }
                  li.thought-item.is-completed .thought-check-box svg {
                    display: block;
                  }
                  li.thought-item.is-completed .thought-title,
                  li.thought-item.is-completed .thought-summary {
                    text-decoration: line-through;
                    opacity: 0.55;
                  }
                  li.thought-item.is-completed .thought-title u,
                  li.thought-item.is-completed .thought-summary u {
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
                    top: calc(
                      var(--category-stack, 0px) + var(--check-nudge, 2px) - 3px +
                        (22px - var(--dot-size)) / 2
                    );
                    z-index: 1;
                  }
                  .thought-dot.is-anchored {
                    transition: top 0.38s ease;
                  }
                  li.thought-item.is-checklist .thought-dot {
                    display: none;
                  }
                  .thought-body {
                    min-width: 0;
                    max-width: 100%;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    padding-right: 0;
                  }
                  li.thought-item.has-graph .thought-body,
                  li.thought-item:has(> .thought-graph) .thought-body {
                    padding-right: 44px;
                  }
                  .thought-graph {
                    position: absolute;
                    top: calc(var(--category-stack, 0px) + var(--graph-nudge, 0px));
                    right: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${graphButtonColor};
                    background: ${graphButtonFill};
                    border-radius: 999px;
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
                    top: -10px;
                    right: 0;
                    bottom: -10px;
                    left: -36px;
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
                  li.thought-item.is-collapsed .thought-category {
                    opacity: 0;
                    height: 0;
                    min-height: 0;
                    margin: 0;
                    padding: 0;
                    pointer-events: none;
                  }
                  li.thought-item.is-collapsed .thought-stripe {
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
                    min-height: 1.35em;
                    overflow-wrap: anywhere;
                    word-break: break-word;
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
                  .thought-title b,
                  .thought-title strong,
                  .thought-summary b,
                  .thought-summary strong {
                    font-family: 'QuicksandBold', sans-serif;
                    font-weight: bold;
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
                    color: ${errorPlaceholderColor};
                    pointer-events: none;
                    font-family: inherit;
                    font-weight: inherit;
                  }
                  ${categoryColorsCss}
                `,
                }}
                onChange={
                  readOnly
                    ? undefined
                    : (html) => {
                        syncThoughtsFromHtml(html);
                        if (keyboardOpenRef.current) {
                          scrollCaretIntoView();
                        }
                      }
                }
                onCursorPosition={
                  readOnly
                    ? undefined
                    : () => {
                        tryApplyPendingFormat();
                        scrollCaretIntoView();
                      }
                }
                onMessage={handleEditorMessage}
              />
            )}
          </View>
          {showToolbar && !dockToolbarToKeyboard ? (
            <ThoughtsEditorToolbar
              showTitles={showTitles}
              showTitlesToggle={!effectiveSimplified}
              onShowTitlesChange={handleShowTitlesChange}
              activeFormats={activeFormats}
              onFormat={handleFormat}
              isChecklist={caretIsChecklist}
              onListTypeChange={handleListType}
            />
          ) : null}
        </View>
        {showToolbar && dockToolbarToKeyboard ? (
          <ThoughtsEditorToolbar
            dockToKeyboard
            showTitles={showTitles}
            showTitlesToggle={!effectiveSimplified}
            onShowTitlesChange={handleShowTitlesChange}
            activeFormats={activeFormats}
            onFormat={handleFormat}
            isChecklist={caretIsChecklist}
            onListTypeChange={handleListType}
          />
        ) : null}
      </View>

      <BottomSheetContent
        ref={categorySheetRef}
        style={{ zIndex: 100 }}
        snapPoints={["100%"]}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableContentPanningGesture={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={() => setCategoryPickerIndex(null)}
      >
        <BottomSheetView className="gap-5 pt-6 bg-background flex-1">
          <BottomSheetHeader className="bg-background">
            <View className="flex-row items-center gap-2">
              <Icon name="shapes" color="foreground" size={18} />
              <Typography variant="h3">Categories</Typography>
            </View>
          </BottomSheetHeader>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View className="flex flex-col w-full flex-wrap gap-2">
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
