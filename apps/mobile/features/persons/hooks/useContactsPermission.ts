import { useCallback } from "react";
import * as Contacts from "expo-contacts";

export const useContactsPermission = () => {
  const requestContactsPermission = useCallback(async () => {
    try {
      const current = await Contacts.getPermissionsAsync();
      if (current.granted) return true;

      const requested = await Contacts.requestPermissionsAsync();
      return requested.granted;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }, []);

  return { requestContactsPermission };
};
