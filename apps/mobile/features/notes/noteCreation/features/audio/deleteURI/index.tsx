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

  const handleDelete = () => {
    if (fileURI) {
      deleteFile(fileURI);
      onDelete();
    } else return;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      cornerRadius="full"
      onPress={handleDelete}
      disabled={!fileURI}
    >
      <Icon name="trash-2" color="card" size={20} />
    </Button>
  );
};
