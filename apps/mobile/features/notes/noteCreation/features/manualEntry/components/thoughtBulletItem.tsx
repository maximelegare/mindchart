import { CategoryKey } from "@repo/sqlite";
import { Category } from "@repo/zod-schemas";
import React from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Control, Controller } from "react-hook-form";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { EditableField } from "@/components/ui/editableField";
import { CATEGORIES_COLORS } from "@repo/theme/categories";
import { Check } from "@/lib/icons/Check";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

const STRIPE_WIDTH = 4;
const BULLET_SIZE = 6;
const STRIPE_COLUMN_WIDTH = 14;
const CONTENT_GAP = 8;
const CATEGORY_LABEL_TOP = -10;
const DOT_ALIGN_TOP = 11;
const DOT_HIT_SIZE = 36;
const CATEGORY_FADE_MS = 4000;

type ThoughtBulletItemProps = {
  index: number;
  control: Control<any>;
  categories: Category[];
  showTitles: boolean;
  registerFieldRef: (key: string, ref: TextInput | null) => void;
  onFieldFocus: (key: string) => void;
  onFieldContentChange?: (key: string) => void;
  onNewBullet: (index: number) => void;
  onBackspaceAtStart: (index: number) => void;
};

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

export const ThoughtBulletItem = ({
  index,
  control,
  categories,
  showTitles,
  registerFieldRef,
  onFieldFocus,
  onFieldContentChange,
  onNewBullet,
  onBackspaceAtStart,
}: ThoughtBulletItemProps) => {
  const { dismiss } = useBottomSheetModal();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const categoryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const collapseProgress = useSharedValue(0);
  const labelOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const contentHeight = useSharedValue(40);

  const stopPulse = React.useCallback(() => {
    pulseScale.value = withTiming(1, { duration: 150 });
  }, [pulseScale]);

  const startPulse = React.useCallback(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.45, { duration: 280 }),
        withTiming(1, { duration: 280 })
      ),
      4,
      false
    );
  }, [pulseScale]);

  const collapseCategory = React.useCallback(() => {
    labelOpacity.value = withTiming(0, { duration: 280 });
    collapseProgress.value = withTiming(1, { duration: 380 }, (finished) => {
      if (finished) {
        runOnJS(setIsExpanded)(false);
        runOnJS(startPulse)();
      }
    });
  }, [collapseProgress, labelOpacity, startPulse]);

  const expandCategory = React.useCallback(() => {
    stopPulse();
    setIsExpanded(true);
    collapseProgress.value = withSpring(0, { damping: 16, stiffness: 220 });
    labelOpacity.value = withTiming(1, { duration: 220 });
  }, [collapseProgress, labelOpacity, stopPulse]);

  const scheduleCategoryFade = React.useCallback(() => {
    if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
    expandCategory();
    categoryTimerRef.current = setTimeout(collapseCategory, CATEGORY_FADE_MS);
  }, [collapseCategory, expandCategory]);

  React.useEffect(() => {
    categoryTimerRef.current = setTimeout(collapseCategory, CATEGORY_FADE_MS);
    return () => {
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
    };
  }, [collapseCategory]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    contentHeight.value = event.nativeEvent.layout.height;
  };

  const stripeAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      collapseProgress.value,
      [0, 1],
      [STRIPE_WIDTH, BULLET_SIZE]
    ),
    height: interpolate(
      collapseProgress.value,
      [0, 1],
      [contentHeight.value, BULLET_SIZE]
    ),
    borderRadius: interpolate(
      collapseProgress.value,
      [0, 1],
      [2, BULLET_SIZE / 2]
    ),
    marginTop: interpolate(collapseProgress.value, [0, 1], [0, DOT_ALIGN_TOP]),
    transform: [{ scale: pulseScale.value }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const handleStripePress = () => {
    if (!isExpanded) {
      scheduleCategoryFade();
    }
  };

  const handleInsertNewItem = () => {
    onNewBullet(index);
  };

  const handleBackspaceAtStart = () => {
    onBackspaceAtStart(index);
  };

  const handleFieldContentChange = (fieldKey: string) => {
    onFieldContentChange?.(fieldKey);
  };

  const renderContent = () => {
    if (showTitles) {
      return (
        <>
          <Controller
            control={control}
            name={`thoughts.${index}.title`}
            render={({ field: { onChange, value } }) => (
              <EditableField
                ref={(ref) => registerFieldRef(`thought-${index}-title`, ref)}
                onFocus={() => onFieldFocus(`thought-${index}-title`)}
                onContentSizeChange={() =>
                  handleFieldContentChange(`thought-${index}-title`)
                }
                onChange={onChange}
                value={value}
                id={`manual-thought-title-${index}`}
                title="Title"
                fontSize="md"
                placeholder="Title"
                onInsertNewItem={handleInsertNewItem}
                onBackspaceAtStart={handleBackspaceAtStart}
              />
            )}
          />
          <Controller
            control={control}
            name={`thoughts.${index}.summary`}
            render={({ field: { onChange, value } }) => (
              <EditableField
                ref={(ref) => registerFieldRef(`thought-${index}-summary`, ref)}
                onFocus={() => onFieldFocus(`thought-${index}-summary`)}
                onContentSizeChange={() =>
                  handleFieldContentChange(`thought-${index}-summary`)
                }
                onChange={onChange}
                value={value}
                id={`manual-thought-summary-${index}`}
                title="Summary"
                fontSize="sm"
                fontFamily="QuicksandRegular"
                placeholder="Enter a bullet point"
                onInsertNewItem={handleInsertNewItem}
                onBackspaceAtStart={handleBackspaceAtStart}
              />
            )}
          />
        </>
      );
    }

    return (
      <Controller
        control={control}
        name={`thoughts.${index}.summary`}
        render={({ field: { onChange, value } }) => (
          <EditableField
            ref={(ref) => registerFieldRef(`thought-${index}-summary`, ref)}
            onFocus={() => onFieldFocus(`thought-${index}-summary`)}
            onContentSizeChange={() =>
              handleFieldContentChange(`thought-${index}-summary`)
            }
            onChange={onChange}
            value={value}
            id={`manual-thought-summary-${index}`}
            title="Summary"
            fontSize="sm"
            fontFamily="QuicksandRegular"
            placeholder="Enter a bullet point"
            onInsertNewItem={handleInsertNewItem}
            onBackspaceAtStart={handleBackspaceAtStart}
          />
        )}
      />
    );
  };

  return (
    <Controller
      control={control}
      name={`thoughts.${index}.categoryId`}
      render={({
        field: { onChange: onCategoryChange, value: categoryId },
      }) => {
        const selectedCategory =
          categories.find((cat) => cat.id === categoryId) || null;
        const bulletColor =
          CATEGORIES_COLORS[(categoryId as CategoryKey) || "uncategorized"];

        const handleSelectCategory = (category: Category) => {
          onCategoryChange(category.id);
          dismiss();
          scheduleCategoryFade();
        };

        const dotHitTop = DOT_ALIGN_TOP + BULLET_SIZE / 2 - DOT_HIT_SIZE / 2;

        const stripeVisual = (
          <Animated.View
            style={[{ backgroundColor: bulletColor }, stripeAnimatedStyle]}
          />
        );

        const stripeElement = isExpanded ? (
          <BottomSheetOpenTrigger asChild>
            <Pressable
              style={{
                width: STRIPE_COLUMN_WIDTH,
                alignItems: "center",
              }}
            >
              {stripeVisual}
            </Pressable>
          </BottomSheetOpenTrigger>
        ) : (
          <View
            style={{
              width: STRIPE_COLUMN_WIDTH,
              alignItems: "center",
            }}
          >
            {stripeVisual}
            <Pressable
              onPress={handleStripePress}
              style={{
                position: "absolute",
                top: dotHitTop,
                width: DOT_HIT_SIZE,
                height: DOT_HIT_SIZE,
              }}
            />
          </View>
        );

        const categoryLabel = (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: CATEGORY_LABEL_TOP,
                left: STRIPE_COLUMN_WIDTH + CONTENT_GAP,
                zIndex: 10,
              },
              labelAnimatedStyle,
            ]}
            pointerEvents={isExpanded ? "auto" : "none"}
          >
            {isExpanded ? (
              <BottomSheetOpenTrigger asChild>
                <Pressable>
                  <Typography className="text-muted-foreground text-xs opacity-80">
                    {selectedCategory?.name}
                  </Typography>
                </Pressable>
              </BottomSheetOpenTrigger>
            ) : (
              <Typography className="text-muted-foreground text-xs opacity-80">
                {selectedCategory?.name}
              </Typography>
            )}
          </Animated.View>
        );

        return (
          <BottomSheet>
            <View className="relative py-1">
              {categoryLabel}

              <View
                className="flex-row items-start"
                style={{ gap: CONTENT_GAP }}
              >
                {stripeElement}

                <View className="flex-1 min-w-0" onLayout={handleContentLayout}>
                  {renderContent()}
                </View>
              </View>
            </View>

            <BottomSheetContent
              style={{ zIndex: 100 }}
              enablePanDownToClose={true}
              enableContentPanningGesture={false}
            >
              <BottomSheetView
                className="gap-5 pt-6 bg-background"
                style={{ left: 19 }}
              >
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
                        selected={selectedCategory?.id === category.id}
                      />
                    ))}
                  </View>
                </ScrollView>
              </BottomSheetView>
            </BottomSheetContent>
          </BottomSheet>
        );
      }}
    />
  );
};
