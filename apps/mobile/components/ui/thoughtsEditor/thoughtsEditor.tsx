import { Category } from "@repo/zod-schemas";
import React from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { useFormContext } from "react-hook-form";
import { RichEditor } from "react-native-pell-rich-editor";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { createEmptyThought, type ThoughtsEditorFormValues } from "./types";
import { htmlToThoughts, thoughtsToHtml } from "./thoughtsHtml";
import {
  BULLET_EDITOR_GUARD_SCRIPT,
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

type ThoughtsEditorProps = {
  noteId: string;
  categories: Category[];
  defaultShowTitles?: boolean;
};

export function ThoughtsEditor({
  noteId,
  categories: _categories,
  defaultShowTitles = false,
}: ThoughtsEditorProps) {
  const { colorScheme } = useColorScheme();
  const { getValues, setValue } = useFormContext<ThoughtsEditorFormValues>();
  const [showTitles, setShowTitles] = React.useState(defaultShowTitles);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);

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

  const handleClearContent = React.useCallback(() => {
    const empty = [createEmptyThought(noteId)];
    setValue("thoughts", empty, { shouldDirty: true });
    richRef.current?.setContentHTML(
      thoughtsToHtml(empty, showTitlesRef.current)
    );
  }, [noteId, setValue]);

  const handleShowTitlesChange = React.useCallback(
    (nextShowTitles: boolean) => {
      setShowTitles(nextShowTitles);
      showTitlesRef.current = nextShowTitles;
      applyEditorFlags(nextShowTitles);
      const html = thoughtsToHtml(getValues("thoughts"), nextShowTitles);
      richRef.current?.setContentHTML(html);
    },
    [applyEditorFlags, getValues]
  );

  const backgroundColor = hsl("card", colorScheme);
  const textColor = hsl("text", colorScheme);
  const placeholderColor = hsl("muted-foreground", colorScheme);
  const caretColor = hsl("primary", colorScheme);
  const headerBg = hsl("muted", colorScheme);

  return (
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
            placeholder="Write your thoughts as bullet points…"
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
                ul {
                  padding-left: 1.25em;
                  margin: 0;
                  list-style-type: disc;
                }
                li {
                  margin-bottom: 0.65em;
                }
              `,
            }}
            onChange={syncThoughtsFromHtml}
            onCursorPosition={scrollCursorIntoView}
          />
        </ScrollView>
      </View>
    </View>
  );
}
