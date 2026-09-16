import { fbs } from "fbtee";

export function GraphCategoriesTabLabel() {
  return <fbt desc="Graph mode tab: categories">Categories</fbt>;
}

export function GraphFoldersTabLabel() {
  return <fbt desc="Graph mode tab: folders">Folders</fbt>;
}

export function graphCategoryFolderDepthMenuAccessibilityLabel(
  depth: 1 | 2 | 3
) {
  return fbs(
    ["Folder levels, currently ", fbs.param("depth", String(depth))],
    "Category graph folder merge floating menu accessibility label"
  );
}

export function GraphCategoryFolderDepthOneLevelLabel() {
  return <fbt desc="Category graph folder merge: one level">1 level</fbt>;
}

export function GraphCategoryFolderDepthTwoLevelsLabel() {
  return <fbt desc="Category graph folder merge: two levels">2 levels</fbt>;
}

export function GraphCategoryFolderDepthThreeLevelsLabel() {
  return <fbt desc="Category graph folder merge: three levels">3 levels</fbt>;
}
