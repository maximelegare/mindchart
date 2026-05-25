/**
 * Lightweight unique id generator (no expo-crypto dep).
 * Good enough for local-only workspace identifiers.
 */
export const generateWorkspaceId = (): string =>
  `ws_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

export const workspaceDbFileName = (id: string): string => `${id}.db`;
