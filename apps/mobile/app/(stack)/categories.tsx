import React from "react";

import { View } from "react-native";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/modal";
import { useCategoriesController } from "@/api/controllers/useCategoriesController";

const withLightness = (hsl: string, lightness: number) => {
  // matches: hsl(120, 50%, 40%)
  const match = hsl.match(
    /hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/
  );

  if (!match) return hsl;

  const [, h, s] = match;
  return `hsl(${h}, ${s}%, ${lightness}%)`;
};

const Categories = () => {
  const { openModal } = useModal();
  const { useFetchAllCategoriesQuery } = useCategoriesController();
  const { data: categories = [] } = useFetchAllCategoriesQuery();

  const handleOpenModal = () => {
    openModal({
      modalName: "INITIALIZE_MODEL_ERROR",
      dismissOnBackgroundPress: false,
    });
  };

  return (
    <PageContainer>
      <>
        <View className="flex-row flex-wrap gap-4">
          {categories.map((category) => (
            <View key={category.id} className="flex-row items-center gap-2">
              <View
                style={{
                  height: 50,

                  borderRadius: 100,
                  backgroundColor: withLightness(category.color, 50),
                  borderWidth: 6,
                  borderColor: category.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography className="text-white m-2">
                  {category.id}
                </Typography>
              </View>
            </View>
          ))}
        </View>
        <Button onPress={handleOpenModal}>
          <Typography>Show Modal</Typography>
        </Button>
      </>
    </PageContainer>
  );
};

export default Categories;
