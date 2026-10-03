import type { ThoughtType } from "@repo/zod-schemas";

export type ThoughtCapabilities = {
  textSelection: boolean;
  boundaryHandles: boolean;
  categoryHighlight: boolean;
  nlp: boolean;
};

export const THOUGHT_CAPABILITIES: Record<ThoughtType, ThoughtCapabilities> = {
  text: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  li: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  checkbox: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  h1: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  h2: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  h3: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  h4: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  h5: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
  h6: {
    textSelection: true,
    boundaryHandles: true,
    categoryHighlight: true,
    nlp: true,
  },
};

export const thoughtCapabilities = (type: ThoughtType): ThoughtCapabilities =>
  THOUGHT_CAPABILITIES[type];
