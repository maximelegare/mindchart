import { AudioModule } from "expo-audio";

export const usePermissions = () => {
  const requestRecordingPermission = async () => {
    try {
      const current = await AudioModule.getRecordingPermissionsAsync();
      if (current.granted || current.status === "granted") {
        return true;
      }

      const requested = await AudioModule.requestRecordingPermissionsAsync();
      return requested.granted || requested.status === "granted";
    } catch (error) {
      console.warn(error);
      return false;
    }
  };

  return {
    requestRecordingPermission,
  };
};
