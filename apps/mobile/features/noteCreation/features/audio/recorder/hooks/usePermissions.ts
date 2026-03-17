import { AudioModule } from "expo-audio";

export const usePermissions = () => {
  const requestRecordingPermission = async () => {
    try {
      const { status } = await AudioModule.getRecordingPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.warn(error);
      return false;
    }
  };

  return {
    requestRecordingPermission,
  };
};
