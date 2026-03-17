import { getInfoAsync, deleteAsync } from "expo-file-system/legacy";

export const useFileSystem = () => {
  const deleteFile = async (fileURI: string) => {
    try {
      const fileInfo = await getInfoAsync(fileURI);
      if (fileInfo.exists) {
        await deleteAsync(fileURI);
      } else {
        console.log("File does not exist:", fileURI);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };
  return {
    deleteFile,
  };
};
