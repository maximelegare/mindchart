import { useFileSystem } from "@/hooks/useFileSystem";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";

export const DeleteURI = ({
  fileURI,
  onDelete,
}: {
  fileURI: string | null;
  onDelete: () => void;
}) => {
  const { deleteFile } = useFileSystem();
  const disabled = !fileURI;

  const handleDelete = () => {
    if (fileURI) {
      deleteFile(fileURI);
      onDelete();
    }
  };

  return (
    <Button
      variant={disabled ? "outline" : "destructive"}
      size="icon"
      cornerRadius="full"
      onPress={handleDelete}
      disabled={disabled}
      accessibilityLabel="Delete recording"
    >
      <Icon
        name="trash-2"
        color={disabled ? "muted-foreground" : "destructive-foreground"}
        size={18}
      />
    </Button>
  );
};
