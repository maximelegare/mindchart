import { Category, Note, Thought, Topic } from "@repo/zod-schemas";
import React from "react";
import { Keyboard, ScrollView, TextInput, View } from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditableField } from "@/components/ui/editableField";
import { Switch } from "@/components/ui/switch";
import { TopicSelector } from "@/features/notes/notePreview/topicSelector";
import { generateID } from "@/utils/genrateID";
import { ThoughtBulletItem } from "./thoughtBulletItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LAYOUT_SIZES } from "@/components/layout/constants";

type ManualNoteFormData = {
  title: string;
  summary: string;
  topic: {
    id: string;
    name: string;
    isNew?: boolean;
    embedding: Float32Array;
    createdAt?: string;
  };
  thoughts: Array<{
    title: string;
    summary: string;
    semanticLabel: string;
    id: string;
    createdAt: string;
    noteId: string;
    categoryId: string;
    thoughtId: string;
  }>;
};

type ManualNoteFormProps = {
  noteId: string;
  defaultTopic: Topic;
  categories: Category[];
  onSubmit: (note: Note, thoughts: Thought[]) => void;
};

const createEmptyThought = (noteId: string) => {
  const thoughtId = generateID();
  return {
    title: "",
    summary: "",
    semanticLabel: "",
    id: thoughtId,
    createdAt: new Date().toISOString(),
    noteId,
    categoryId: "uncategorized",
    thoughtId,
  };
};

const TITLE_SCROLL_PADDING = 12;
const FIELD_CHIP_HEIGHT = 40;
const KEYBOARD_GAP = 40;
const CURSOR_CLEARANCE = 28;
// const CONTENT_PADDING_TOP = 5;
const SCROLL_TOP_INSET = 24;
const SCROLL_VISIBILITY_EPSILON = 4;
const KEYBOARD_SCROLL_PADDING = 48;
const NATIVE_RELEASE_MS = 120;
const IDLE_CHECK_MS = 40;
const ERASE_STEP_DEBOUNCE_MS = 32;

type ThoughtFieldPart = "title" | "summary";

function parseThoughtFieldKey(
  fieldKey: string
): { index: number; field: ThoughtFieldPart } | null {
  const match = fieldKey.match(/^thought-(\d+)-(title|summary)$/);
  if (!match) return null;
  return {
    index: Number(match[1]),
    field: match[2] as ThoughtFieldPart,
  };
}

export const ManualNoteForm = ({
  noteId,
  defaultTopic,
  categories,
  onSubmit,
}: ManualNoteFormProps) => {
  const insets = useSafeAreaInsets();
  const tabBarOffset =
    LAYOUT_SIZES.TAB_BAR_HEIGHT +
    LAYOUT_SIZES.TAB_BAR_PADDING_COMPENSATION +
    insets.bottom;

  const [showTitles, setShowTitles] = React.useState(false);
  const [titleContainerWidth, setTitleContainerWidth] = React.useState(0);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [thoughtsMaxHeight, setThoughtsMaxHeight] = React.useState<
    number | undefined
  >(undefined);

  const thoughtsScrollRef = React.useRef<ScrollView>(null);
  const thoughtsScrollAreaRef = React.useRef<View>(null);
  const scrollOffsetRef = React.useRef(0);
  const focusedFieldKeyRef = React.useRef<string | null>(null);
  const keyboardScreenYRef = React.useRef<number | null>(null);
  const fieldRefs = React.useRef<Record<string, TextInput | null>>({});
  const pendingFocusKeyRef = React.useRef<string | null>(null);
  const insertingBulletRef = React.useRef(false);
  const scrollTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const contentScrollTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const thoughtsScrollHeightRef = React.useRef(0);
  const thoughtsContentHeightRef = React.useRef(0);
  const pendingFocusAtEndRef = React.useRef(false);
  const lastNativeBackspaceAtRef = React.useRef(0);
  const keyboardAnchorFieldKeyRef = React.useRef<string | null>(null);
  const eraseActiveRef = React.useRef(false);
  const eraseIdleCheckRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const eraseChainingRef = React.useRef(false);
  const eraseStepDedupRef = React.useRef<{
    fieldKey: string;
    at: number;
  } | null>(null);
  const showTitlesRef = React.useRef(showTitles);
  showTitlesRef.current = showTitles;

  const updateThoughtsMaxHeight = React.useCallback(() => {
    const keyboardTop = keyboardScreenYRef.current;
    const scrollArea = thoughtsScrollAreaRef.current;
    if (!keyboardTop || !scrollArea) {
      setThoughtsMaxHeight(undefined);
      return;
    }

    scrollArea.measureInWindow((_x, y, _width, _height) => {
      const nextMaxHeight = Math.max(120, keyboardTop - y - KEYBOARD_GAP);
      setThoughtsMaxHeight(nextMaxHeight);
    });
  }, []);

  const scrollFieldIntoView = React.useCallback(
    (key: string, animated = true) => {
      const input = fieldRefs.current[key];
      const scrollView = thoughtsScrollRef.current;
      const scrollArea = thoughtsScrollAreaRef.current;
      if (!input || !scrollView || !scrollArea) return;

      const viewportHeight = thoughtsScrollHeightRef.current;
      if (viewportHeight <= 0) return;

      scrollArea.measureInWindow((_sx, scrollY, _sw, scrollAreaHeight) => {
        const visibleTop = scrollY + SCROLL_TOP_INSET;

        input.measureInWindow((_x, fieldY, _w, fieldHeight) => {
          const fieldTop = fieldY;
          const fieldBottom = fieldY + fieldHeight;
          const idealBottom = scrollY + scrollAreaHeight - CURSOR_CLEARANCE;
          const clipBottom = scrollY + scrollAreaHeight;
          const maxScrollY = Math.max(
            0,
            thoughtsContentHeightRef.current - viewportHeight
          );
          const atMaxScroll =
            Math.abs(scrollOffsetRef.current - maxScrollY) < 2;

          if (
            fieldBottom <= idealBottom + SCROLL_VISIBILITY_EPSILON &&
            fieldTop >= visibleTop - SCROLL_VISIBILITY_EPSILON
          ) {
            return;
          }

          if (
            atMaxScroll &&
            fieldBottom <= clipBottom + SCROLL_VISIBILITY_EPSILON &&
            fieldTop >= visibleTop - SCROLL_VISIBILITY_EPSILON
          ) {
            return;
          }

          if (fieldBottom > idealBottom) {
            const nextY = Math.min(
              maxScrollY,
              scrollOffsetRef.current + (fieldBottom - idealBottom)
            );
            if (Math.abs(nextY - scrollOffsetRef.current) < 1) {
              if (fieldBottom <= clipBottom + SCROLL_VISIBILITY_EPSILON) {
                return;
              }
            }
            scrollView.scrollTo({
              y: nextY,
              animated,
            });
            return;
          }

          if (fieldTop < visibleTop) {
            const nextY = Math.min(
              maxScrollY,
              Math.max(0, scrollOffsetRef.current - (visibleTop - fieldTop))
            );
            if (Math.abs(nextY - scrollOffsetRef.current) < 1) return;
            scrollView.scrollTo({
              y: nextY,
              animated,
            });
          }
        });
      });
    },
    []
  );

  const scheduleScrollToFocusedField = React.useCallback(
    (delay = 200) => {
      if (eraseActiveRef.current || eraseChainingRef.current) {
        return;
      }

      scrollTimersRef.current.forEach(clearTimeout);
      scrollTimersRef.current = [];

      const key = focusedFieldKeyRef.current;
      if (!key || keyboardScreenYRef.current == null) return;

      const timer = setTimeout(() => {
        if (focusedFieldKeyRef.current === key) {
          scrollFieldIntoView(key, true);
        }
      }, delay);

      scrollTimersRef.current = [timer];
    },
    [scrollFieldIntoView]
  );

  React.useEffect(() => {
    return () => {
      scrollTimersRef.current.forEach(clearTimeout);
      if (contentScrollTimerRef.current) {
        clearTimeout(contentScrollTimerRef.current);
      }
      if (eraseIdleCheckRef.current) {
        clearInterval(eraseIdleCheckRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      keyboardScreenYRef.current = event.endCoordinates.screenY;
      requestAnimationFrame(updateThoughtsMaxHeight);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      if (eraseActiveRef.current || eraseChainingRef.current) {
        const key =
          keyboardAnchorFieldKeyRef.current ?? focusedFieldKeyRef.current;
        if (key) {
          setTimeout(() => {
            fieldRefs.current[key]?.focus();
          }, 0);
        }
        return;
      }

      setKeyboardHeight(0);
      keyboardScreenYRef.current = null;
      setThoughtsMaxHeight(undefined);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [updateThoughtsMaxHeight]);

  React.useEffect(() => {
    if (thoughtsMaxHeight == null || !focusedFieldKeyRef.current) return;
    return scheduleScrollToFocusedField(50);
  }, [thoughtsMaxHeight, scheduleScrollToFocusedField]);

  const handleFieldFocus = React.useCallback(
    (key: string) => {
      if (insertingBulletRef.current) {
        focusedFieldKeyRef.current = key;
        return;
      }

      focusedFieldKeyRef.current = key;
      keyboardAnchorFieldKeyRef.current = key;

      if (
        keyboardScreenYRef.current != null &&
        thoughtsMaxHeight != null &&
        !eraseActiveRef.current &&
        !eraseChainingRef.current
      ) {
        scheduleScrollToFocusedField(100);
      }
    },
    [thoughtsMaxHeight, scheduleScrollToFocusedField]
  );

  const handleFieldContentChange = React.useCallback(
    (key: string) => {
      if (
        focusedFieldKeyRef.current !== key ||
        keyboardHeight === 0 ||
        thoughtsMaxHeight == null ||
        eraseActiveRef.current ||
        eraseChainingRef.current
      ) {
        return;
      }

      if (contentScrollTimerRef.current) {
        clearTimeout(contentScrollTimerRef.current);
      }

      contentScrollTimerRef.current = setTimeout(() => {
        contentScrollTimerRef.current = null;
        if (focusedFieldKeyRef.current === key) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (focusedFieldKeyRef.current === key) {
                scrollFieldIntoView(key, false);
              }
            });
          });
        }
      }, 120);
    },
    [keyboardHeight, thoughtsMaxHeight, scrollFieldIntoView]
  );

  const { control, handleSubmit, getValues, setValue } =
    useForm<ManualNoteFormData>({
      defaultValues: {
        title: "",
        summary: "",
        topic: {
          id: defaultTopic.id,
          name: defaultTopic.name,
          isNew: defaultTopic.isNew,
          embedding: defaultTopic.embedding,
          createdAt: defaultTopic.createdAt,
        },
        thoughts: [createEmptyThought(noteId)],
      },
    });

  const {
    fields,
    remove: thoughtsRemove,
    insert: thoughtsInsert,
    replace: thoughtsReplace,
  } = useFieldArray({
    control,
    name: "thoughts",
  });

  const registerFieldRef = React.useCallback(
    (key: string, ref: TextInput | null) => {
      fieldRefs.current[key] = ref;
    },
    []
  );

  const getPrimaryFieldKey = React.useCallback(
    (index: number) =>
      showTitles ? `thought-${index}-title` : `thought-${index}-summary`,
    [showTitles]
  );

  const scheduleFocusAfterUpdate = React.useCallback((key: string) => {
    pendingFocusKeyRef.current = key;
  }, []);

  const handleFocusField = React.useCallback(
    (key: string) => {
      focusedFieldKeyRef.current = key;
      const input = fieldRefs.current[key];
      if (input) {
        input.focus();
        if (keyboardScreenYRef.current != null && thoughtsMaxHeight != null) {
          scheduleScrollToFocusedField(100);
        }
        return;
      }
      scheduleFocusAfterUpdate(key);
    },
    [thoughtsMaxHeight, scheduleScrollToFocusedField, scheduleFocusAfterUpdate]
  );

  const stopEraseSession = React.useCallback(() => {
    if (eraseIdleCheckRef.current) {
      clearInterval(eraseIdleCheckRef.current);
      eraseIdleCheckRef.current = null;
    }
    eraseActiveRef.current = false;
  }, []);

  const startEraseIdleWatcher = React.useCallback(() => {
    if (eraseIdleCheckRef.current) return;

    eraseIdleCheckRef.current = setInterval(() => {
      const nativeIdle =
        Date.now() - lastNativeBackspaceAtRef.current > NATIVE_RELEASE_MS;

      if (eraseActiveRef.current && nativeIdle) {
        stopEraseSession();
      }

      if (!eraseActiveRef.current && eraseIdleCheckRef.current) {
        clearInterval(eraseIdleCheckRef.current);
        eraseIdleCheckRef.current = null;
      }
    }, IDLE_CHECK_MS);
  }, [stopEraseSession]);

  const markEraseChain = React.useCallback(() => {
    eraseChainingRef.current = true;
  }, []);

  const clearEraseChain = React.useCallback(() => {
    eraseChainingRef.current = false;
  }, []);

  const applyFocusAtEnd = React.useCallback(
    (fieldKey: string) => {
      const parsed = parseThoughtFieldKey(fieldKey);
      const input = fieldRefs.current[fieldKey];
      if (!input || !parsed) return false;

      const text = getValues(`thoughts.${parsed.index}.${parsed.field}`) ?? "";
      input.focus();
      input.setNativeProps?.({
        selection: { start: text.length, end: text.length },
      });
      return true;
    },
    [getValues]
  );

  const advanceToTitleField = React.useCallback(
    (index: number) => {
      const titleKey = `thought-${index}-title`;
      focusedFieldKeyRef.current = titleKey;
      keyboardAnchorFieldKeyRef.current = titleKey;
      markEraseChain();

      if (applyFocusAtEnd(titleKey)) {
        requestAnimationFrame(() => {
          applyFocusAtEnd(titleKey);
          clearEraseChain();
        });
        return;
      }

      pendingFocusKeyRef.current = titleKey;
      pendingFocusAtEndRef.current = true;
    },
    [applyFocusAtEnd, clearEraseChain, markEraseChain]
  );

  const removeBulletAndFocusPrevious = React.useCallback(
    (index: number) => {
      const thoughts = getValues("thoughts");
      if (thoughts.length <= 1 || index >= thoughts.length) return;

      const focusIndex = Math.max(0, index - 1);
      const previousThought = thoughts[focusIndex];
      const focusKey =
        showTitlesRef.current && previousThought?.summary.trim().length === 0
          ? `thought-${focusIndex}-title`
          : `thought-${focusIndex}-summary`;

      focusedFieldKeyRef.current = focusKey;
      keyboardAnchorFieldKeyRef.current = focusKey;
      markEraseChain();

      if (applyFocusAtEnd(focusKey)) {
        requestAnimationFrame(() => {
          applyFocusAtEnd(focusKey);
          const currentThoughts = getValues("thoughts");
          if (index < currentThoughts.length) {
            thoughtsRemove(index);
          }
          clearEraseChain();
        });
        return;
      }

      pendingFocusKeyRef.current = focusKey;
      pendingFocusAtEndRef.current = true;

      requestAnimationFrame(() => {
        const currentThoughts = getValues("thoughts");
        if (index >= currentThoughts.length) return;
        thoughtsRemove(index);
      });
    },
    [
      applyFocusAtEnd,
      clearEraseChain,
      getValues,
      markEraseChain,
      thoughtsRemove,
    ]
  );

  const chainFromEmptyField = React.useCallback(
    (
      parsed: { index: number; field: ThoughtFieldPart },
      thought: { summary: string }
    ) => {
      if (parsed.field === "summary") {
        if (showTitlesRef.current) {
          advanceToTitleField(parsed.index);
          return;
        }
        removeBulletAndFocusPrevious(parsed.index);
        return;
      }

      if (thought.summary.trim().length > 0) {
        return;
      }

      removeBulletAndFocusPrevious(parsed.index);
    },
    [advanceToTitleField, removeBulletAndFocusPrevious]
  );

  const performBackspaceStep = React.useCallback(() => {
    const fieldKey = focusedFieldKeyRef.current;
    if (!fieldKey) return;

    const parsed = parseThoughtFieldKey(fieldKey);
    if (!parsed) return;

    const thoughts = getValues("thoughts");
    const thought = thoughts[parsed.index];
    if (!thought) return;

    const currentValue = thought[parsed.field] ?? "";
    if (currentValue.length > 0) {
      const nextValue = currentValue.slice(0, -1);
      setValue(`thoughts.${parsed.index}.${parsed.field}`, nextValue, {
        shouldDirty: true,
      });
      if (nextValue.length === 0) {
        chainFromEmptyField(parsed, thought);
      }
      return;
    }

    chainFromEmptyField(parsed, thought);
  }, [chainFromEmptyField, getValues, setValue]);

  const handleBackspaceEmptyField = React.useCallback(
    (fieldKey: string) => {
      const parsed = parseThoughtFieldKey(fieldKey);
      if (!parsed) return;

      const thoughts = getValues("thoughts");
      const thought = thoughts[parsed.index];
      if (!thought) return;

      chainFromEmptyField(parsed, thought);
    },
    [chainFromEmptyField, getValues]
  );

  const notifyBackspaceKey = React.useCallback(
    (fieldKey: string) => {
      const now = Date.now();

      if (!parseThoughtFieldKey(fieldKey)) return;

      if (
        !eraseActiveRef.current &&
        fieldKey !== focusedFieldKeyRef.current &&
        !eraseChainingRef.current
      ) {
        return;
      }

      const dedup = eraseStepDedupRef.current;
      if (
        dedup &&
        dedup.fieldKey === fieldKey &&
        now - dedup.at < ERASE_STEP_DEBOUNCE_MS
      ) {
        return;
      }
      eraseStepDedupRef.current = { fieldKey, at: now };

      lastNativeBackspaceAtRef.current = now;
      keyboardAnchorFieldKeyRef.current = fieldKey;
      eraseActiveRef.current = true;
      startEraseIdleWatcher();
      performBackspaceStep();
    },
    [performBackspaceStep, startEraseIdleWatcher]
  );

  const handleBackspaceAtStart = React.useCallback(
    (fieldKey: string) => {
      if (eraseActiveRef.current) return;

      if (
        focusedFieldKeyRef.current &&
        fieldKey !== focusedFieldKeyRef.current
      ) {
        return;
      }
      handleBackspaceEmptyField(fieldKey);
    },
    [handleBackspaceEmptyField]
  );

  React.useLayoutEffect(() => {
    const key = pendingFocusKeyRef.current;
    if (!key) return;

    pendingFocusKeyRef.current = null;
    const focusAtEnd = pendingFocusAtEndRef.current;
    pendingFocusAtEndRef.current = false;
    focusedFieldKeyRef.current = key;
    keyboardAnchorFieldKeyRef.current = key;

    const focusTarget = () => {
      const input = fieldRefs.current[key];
      if (!input) return false;
      input.focus();
      if (focusAtEnd) {
        const parsed = parseThoughtFieldKey(key);
        if (parsed) {
          const text =
            getValues(`thoughts.${parsed.index}.${parsed.field}`) ?? "";
          input.setNativeProps?.({
            selection: { start: text.length, end: text.length },
          });
        }
      }
      if (eraseActiveRef.current || eraseChainingRef.current) {
        requestAnimationFrame(() => input.focus());
      }
      clearEraseChain();
      return true;
    };

    if (focusTarget()) return;

    requestAnimationFrame(() => {
      if (!focusTarget()) {
        setTimeout(() => focusTarget(), 0);
      }
    });
  }, [clearEraseChain, fields, getValues]);

  const handleFormSubmit = (data: ManualNoteFormData) => {
    const thoughts: Thought[] = data.thoughts
      .filter(
        (thought) =>
          thought.title.trim() ||
          thought.summary.trim() ||
          thought.semanticLabel.trim()
      )
      .map((thought) => ({
        ...thought,
        title: thought.title.trim(),
        summary: thought.summary.trim(),
        semanticLabel:
          thought.semanticLabel.trim() ||
          thought.title.trim() ||
          thought.summary.trim(),
        createdAt: thought.createdAt,
      }));

    if (thoughts.length === 0) return;

    const note: Note = {
      id: noteId,
      title: data.title.trim(),
      summary: data.summary.trim(),
      rawText: "",
      topicId: data.topic.id,
      createdAt: new Date().toISOString(),
    };

    onSubmit(note, thoughts);
  };

  const handleClearContent = React.useCallback(() => {
    stopEraseSession();
    clearEraseChain();
    thoughtsReplace([createEmptyThought(noteId)]);
    scrollOffsetRef.current = 0;
    thoughtsScrollRef.current?.scrollTo({ y: 0, animated: false });

    const firstKey = showTitles ? `thought-0-title` : `thought-0-summary`;
    focusedFieldKeyRef.current = firstKey;
    keyboardAnchorFieldKeyRef.current = firstKey;
    pendingFocusKeyRef.current = firstKey;
    pendingFocusAtEndRef.current = false;
  }, [clearEraseChain, noteId, showTitles, stopEraseSession, thoughtsReplace]);

  const handleNewBullet = (index: number) => {
    if (insertingBulletRef.current) return;
    insertingBulletRef.current = true;

    const nextIndex = index + 1;
    const nextKey = getPrimaryFieldKey(nextIndex);

    focusedFieldKeyRef.current = nextKey;

    if (nextIndex < fields.length) {
      fieldRefs.current[nextKey]?.focus();
      setTimeout(() => {
        insertingBulletRef.current = false;
      }, 400);
      return;
    }

    thoughtsInsert(nextIndex, createEmptyThought(noteId));
    pendingFocusKeyRef.current = nextKey;

    setTimeout(() => {
      insertingBulletRef.current = false;
    }, 400);
  };

  return (
    <View className="flex-1 flex-col gap-2 w-full min-h-0">
      <View className="flex-row gap-3 items-start w-full shrink-0">
        <View className="flex-1 min-w-0 flex-col gap-1">
          <Label nativeID="title">Title</Label>
          <Controller
            control={control}
            name="title"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View
                className="rounded-lg bg-card border border-input overflow-hidden justify-center"
                style={{ minHeight: FIELD_CHIP_HEIGHT }}
                onLayout={(event) =>
                  setTitleContainerWidth(event.nativeEvent.layout.width)
                }
              >
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingHorizontal: TITLE_SCROLL_PADDING,
                    alignItems: "center",
                    minHeight: FIELD_CHIP_HEIGHT,
                  }}
                >
                  <EditableField
                    className="p-0 m-0 bg-transparent border-0"
                    style={{
                      minWidth: Math.max(
                        titleContainerWidth - TITLE_SCROLL_PADDING * 2,
                        Math.max(value.length, 12) * 9 + 8
                      ),
                      minHeight: 24,
                      paddingVertical: 0,
                      textAlignVertical: "center",
                    }}
                    onChange={onChange}
                    value={value}
                    id="manual-note-title"
                    title="Title"
                    fontSize="md"
                    placeholder="Enter a title"
                    multiline={false}
                  />
                </ScrollView>
              </View>
            )}
          />
        </View>

        <View className="shrink-0 flex-col gap-1">
          <Label nativeID="topic">Topic</Label>
          <Controller
            control={control}
            name="topic"
            render={({ field: { onChange, value } }) => (
              <TopicSelector
                selectedTopic={{ ...value }}
                onSelect={(topic) => onChange({ ...topic })}
                maxChars={18}
              />
            )}
          />
        </View>
      </View>

      <View className="flex-col gap-1 flex-1 min-h-0">
        <View className="flex-row items-center justify-between shrink-0">
          <Label nativeID="thoughts">Content</Label>
          <View className="flex-row items-center gap-2">
            <Typography className="text-muted-foreground text-sm">
              Titles
            </Typography>
            <Switch checked={showTitles} onCheckedChange={setShowTitles} />
          </View>
        </View>

        <View className=" flex-1 min-h-0 rounded-lg bg-card border border-input px-3 pb-2 overflow-hidden">
          <View className="flex-row justify-end items-center shrink-0">
            <Button onPress={handleClearContent} variant="ghost" size="sm">
              <Typography className="text-muted-foreground text-xs">
                clear
              </Typography>
            </Button>
          </View>
          <View
            ref={thoughtsScrollAreaRef}
            className="flex-1 min-h-0"
            style={
              thoughtsMaxHeight != null
                ? { maxHeight: thoughtsMaxHeight }
                : undefined
            }
          >
            <ScrollView
              ref={thoughtsScrollRef}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator
              removeClippedSubviews={false}
              style={{ flex: 1 }}
              onLayout={(event) => {
                thoughtsScrollHeightRef.current =
                  event.nativeEvent.layout.height;
              }}
              onScroll={(event) => {
                scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
              }}
              onContentSizeChange={(_width, height) => {
                thoughtsContentHeightRef.current = height;
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{
                // paddingTop: CONTENT_PADDING_TOP,
                paddingBottom:
                  keyboardHeight > 0 ? KEYBOARD_SCROLL_PADDING : 12,
              }}
            >
              <View className="flex-col gap-3">
                {fields.map((field, index) => (
                  <ThoughtBulletItem
                    key={field.id}
                    index={index}
                    control={control}
                    categories={categories}
                    showTitles={showTitles}
                    registerFieldRef={registerFieldRef}
                    onFieldFocus={handleFieldFocus}
                    onFieldContentChange={handleFieldContentChange}
                    onNewBullet={handleNewBullet}
                    onFocusField={handleFocusField}
                    onBackspaceAtStart={handleBackspaceAtStart}
                    onBackspaceKey={notifyBackspaceKey}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {keyboardHeight === 0 ? (
        <View
          className="items-center shrink-0"
          style={{ paddingBottom: tabBarOffset }}
        >
          <Button
            onPress={handleSubmit(handleFormSubmit)}
            style={{ width: 250 }}
          >
            <Typography>Save Note</Typography>
          </Button>
        </View>
      ) : null}
    </View>
  );
};
