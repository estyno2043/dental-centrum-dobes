"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a media query without tripping hydration: the server renders
 * `serverValue`, and the client takes over once `matchMedia` is available.
 */
export function useMediaQuery(query: string, serverValue: boolean): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const queryList = globalThis.matchMedia?.(query);

      if (!queryList) return () => undefined;

      queryList.addEventListener("change", onChange);
      return () => queryList.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => globalThis.matchMedia?.(query).matches ?? false,
    [query],
  );

  const getServerSnapshot = useCallback(() => serverValue, [serverValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
