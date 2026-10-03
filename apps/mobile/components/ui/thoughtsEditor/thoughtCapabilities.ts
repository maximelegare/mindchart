import type { ThoughtType } from "@repo/zod-schemas";

export type ThoughtCapabilities = {
  textSelection: boolean;
  boundaryHandles: boolean;
  categoryHighlight: boolean;
  nlp: boolean;
  title: boolean;
  graph: boolean;
};

const DEFAULT_CAPABILITIES: ThoughtCapabilities = {
  textSelection: true,
  boundaryHandles: true,
  categoryHighlight: true,
  nlp: true,
  title: true,
  graph: true,
};

const HEADING_CAPABILITIES: ThoughtCapabilities = {
  textSelection: true,
  boundaryHandles: true,
  categoryHighlight: false,
  nlp: false,
  title: false,
  graph: false,
};

export const THOUGHT_CAPABILITIES: Record<ThoughtType, ThoughtCapabilities> = {
  text: DEFAULT_CAPABILITIES,
  li: DEFAULT_CAPABILITIES,
  checkbox: DEFAULT_CAPABILITIES,
  h1: HEADING_CAPABILITIES,
  h2: HEADING_CAPABILITIES,
  h3: HEADING_CAPABILITIES,
  h4: HEADING_CAPABILITIES,
  h5: HEADING_CAPABILITIES,
  h6: HEADING_CAPABILITIES,
};

export const thoughtCapabilities = (type: ThoughtType): ThoughtCapabilities =>
  THOUGHT_CAPABILITIES[type];
