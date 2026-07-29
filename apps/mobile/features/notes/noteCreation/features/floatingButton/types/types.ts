import type { ReactNode } from "react";
import { IconName } from "@/components/ui/icons/icon-registry";

export type FloatingModalTabId = "create" | "keyboard";

export type FloatingModalTab = {
  id: FloatingModalTabId;
  label: string;
  icon: IconName;
  render: () => ReactNode;
};
