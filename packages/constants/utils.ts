/**
 * Creates route objects with different prefixes from a base routes object
 * @param baseRoutes - Base routes without any prefix
 * @param prefixes - Object with different prefixes for different environments
 * @returns Object with route objects for each prefix
 */
export const createRouteSets = <T extends Record<string, string>>(
  baseRoutes: T,
  prefixes: Record<string, string>
) => {
  const result = {} as Record<string, T>;

  for (const [envName, prefix] of Object.entries(prefixes)) {
    result[envName] = {} as T;

    for (const [key, value] of Object.entries(baseRoutes)) {
      result[envName][key as keyof T] = `${prefix}${value}` as T[keyof T];
    }
  }

  return result;
};

/**
 * Removes the first segment from all path values in a routes object
 * @param routes - Object with route paths as values
 * @param prefixToRemove - The prefix to remove (e.g., "/openai")
 * @returns New object with the same keys but paths without the prefix
 */
export const removePathPrefix = <T extends Record<string, string>>(
  routes: T,
  prefixToRemove: string
): T => {
  const result = {} as T;

  for (const [key, value] of Object.entries(routes)) {
    // Remove the prefix from the path
    const pathWithoutPrefix = value.startsWith(prefixToRemove)
      ? value.substring(prefixToRemove.length)
      : value;

    result[key as keyof T] = pathWithoutPrefix as T[keyof T];
  }

  return result;
};

/**
 * Removes the first segment from all path values in a routes object
 * Automatically detects the prefix from the first route
 * @param routes - Object with route paths as values
 * @returns New object with the same keys but paths without the first segment
 */
export const removeFirstPathSegment = <T extends Record<string, string>>(
  routes: T
): T => {
  const firstValue = Object.values(routes)[0];
  if (!firstValue) return routes;

  // Extract the first segment (e.g., "/openai" from "/openai/generate-note")
  const firstSegment = firstValue.split("/")[1];
  const prefixToRemove = firstSegment ? `/${firstSegment}` : "";

  return removePathPrefix(routes, prefixToRemove);
};
