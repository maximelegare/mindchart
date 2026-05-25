-- Custom SQL migration file, put your code below! --
CREATE VIRTUAL TABLE thought_fts USING fts5(
  id UNINDEXED,
  title,
  summary,
  semantic_label
);