import { useRouter } from "expo-router";
import { Button } from "../button";
import { Icon } from "../icons/icon";
import { View } from "react-native";

export const GraphButton = ({
  id,
  elementType,
  type = "button",
}: {
  type?: "button" | "icon";
  id: string;
  elementType: "category" | "thought" | "note";
}) => {
  const { push } = useRouter();

  if (type === "button") {
    return (
      <Button
        variant="ghost"
        size="xs"
        className="px-4"
        onPress={() =>
          push({
            pathname: "/graph/[id]",
            params: {
              id: `${elementType}-${id}`,
              _t: Date.now(),
            },
          })
        }
      >
        <Icon
          size={20}
          color="text"
          name="graph"
          style={{ opacity: 0.8, paddingLeft: 4, paddingRight: 4 }}
        />
      </Button>
    );
  } else if (type === "icon") {
    return (
      <View className="px-4">
        <Icon size={20} color="text" name="graph" style={{ opacity: 0.8 }} />
      </View>
    );
  }
};
