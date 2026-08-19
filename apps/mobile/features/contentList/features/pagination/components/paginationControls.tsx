import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
};

export const PaginationControls = ({
  page,
  pageCount,
  onPageChange,
  isFetching = false,
}: PaginationControlsProps) => {
  if (pageCount <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <View className="flex-row items-center justify-between gap-3 pt-4 pb-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev || isFetching}
        onPress={() => onPageChange(page - 1)}
        className="flex-row items-center gap-1"
      >
        <Icon name="chevron-left" color="foreground" size={16} />
        <Typography variant="p" className="pb-0">
          Prev
        </Typography>
      </Button>

      <Typography variant="p" className="pb-0 opacity-70">
        Page {page} of {pageCount}
      </Typography>

      <Button
        variant="outline"
        size="sm"
        disabled={!canNext || isFetching}
        onPress={() => onPageChange(page + 1)}
        className="flex-row items-center gap-1"
      >
        <Typography variant="p" className="pb-0">
          Next
        </Typography>
        <Icon name="chevron-right" color="foreground" size={16} />
      </Button>
    </View>
  );
};
