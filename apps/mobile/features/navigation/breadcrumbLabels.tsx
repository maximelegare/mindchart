import { fbs } from "fbtee";

export function BreadcrumbLinkToggleLabel() {
  return <fbt desc="Breadcrumb link toggle chip">Breadcrumbs</fbt>;
}

export function breadcrumbLinkAccessibilityLabel(linked: boolean) {
  if (linked) {
    return fbs(
      "Unlink breadcrumbs",
      "Accessibility label: unlink notes and graph breadcrumbs"
    );
  }

  return fbs(
    "Link breadcrumbs",
    "Accessibility label: link notes and graph breadcrumbs"
  );
}
