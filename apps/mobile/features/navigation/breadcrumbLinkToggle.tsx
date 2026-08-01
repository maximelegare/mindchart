import React from "react";
import { OptionChip } from "@/features/contentList/components/optionsBar/components/options/optionChip";
import { useBreadcrumbLinkStore } from "./breadcrumbLinkStore";

/** Toggle chip: links notes ↔ graph breadcrumbs (not a menu). */
export function BreadcrumbLinkToggle() {
  const linked = useBreadcrumbLinkStore((state) => state.linkBreadcrumbs);
  const toggle = useBreadcrumbLinkStore((state) => state.toggleLinkBreadcrumbs);

  return (
    <OptionChip
      icon={linked ? "link-2" : "link-2-off"}
      label="Breadcrumbs"
      selected={linked}
      muted={!linked}
      onPress={toggle}
      accessibilityLabel={linked ? "Unlink breadcrumbs" : "Link breadcrumbs"}
    />
  );
}
