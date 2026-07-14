import { View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarButton } from "./tabBarButton";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ bottom: 0 }}
      className="right-0 left-0 bg-popover z-30 absolute rounded-t-xl overflow-hidden"
    >
      <View className="flex-row items-start">
        {state.routes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index].key === route.key;
          const label = options.tabBarLabel ?? options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarButton
              key={route.name}
              routeName={route.name}
              onPress={onPress}
              isFocused={isFocused}
              label={label as string}
              bottomInset={insets.bottom}
            />
          );
        })}
      </View>
    </View>
  );
}
