import type { JawSequenceManifest } from "./jawSequenceManifest.generated";

export type DecodedJawFrame = Readonly<{
  index: number;
  source: CanvasImageSource;
  close: () => void;
}>;

export type JawSequenceLoader = Readonly<{
  setTarget: (index: number, direction: -1 | 0 | 1) => void;
  getExact: (index: number) => DecodedJawFrame | undefined;
  getNearest: (index: number) => DecodedJawFrame | undefined;
  subscribe: (listener: () => void) => () => void;
  setVisible: (visible: boolean) => void;
  inspect: () => Readonly<{ decoded: number; pending: number; target: number }>;
  dispose: () => void;
}>;

export type BrowserJawFrameDecoder = ((
  url: string,
  signal: AbortSignal,
) => Promise<DecodedJawFrame>) & Readonly<{
  preload: () => Promise<void>;
}>;

type CacheEntry = {
  frame: DecodedJawFrame;
  usedAt: number;
};

type PendingEntry = {
  controller: AbortController;
};

function abortError(): Error {
  if (typeof DOMException === "function") return new DOMException("jaw frame decode aborted", "AbortError");
  const error = new Error("jaw frame decode aborted");
  error.name = "AbortError";
  return error;
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw abortError();
}

function waitForAbortable<T>(
  promise: Promise<T>,
  signal: AbortSignal,
  onLateSuccess?: (value: T) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const onAbort = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    };

    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) onAbort();

    promise.then(
      (value) => {
        if (settled) {
          onLateSuccess?.(value);
          return;
        }
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

function closeOnce(close: () => void): () => void {
  let closed = false;
  return () => {
    if (closed) return;
    closed = true;
    close();
  };
}

export function createJawSequenceLoader(options: {
  manifest: JawSequenceManifest;
  cacheLimit: number;
  decode: (url: string, signal: AbortSignal) => Promise<DecodedJawFrame>;
}): JawSequenceLoader {
  const { manifest, cacheLimit, decode } = options;
  const minimumCacheLimit = Math.min(manifest.frameCount, 5);
  if (!Number.isInteger(cacheLimit) || cacheLimit < minimumCacheLimit) {
    throw new Error(`jaw sequence cacheLimit must be an integer of at least ${minimumCacheLimit}`);
  }

  const frameByIndex = new Map(manifest.frames.map((item) => [item.index, item]));
  const cache = new Map<number, CacheEntry>();
  const pending = new Map<number, PendingEntry>();
  const listeners = new Set<() => void>();
  const closedFrames = new WeakSet<object>();
  let target = clampFrame(manifest.startFrame);
  let priority: readonly number[] = [];
  let visible = true;
  let disposed = false;
  let clock = 0;

  function clampFrame(index: number): number {
    if (index === Number.POSITIVE_INFINITY) return manifest.frameCount;
    const finite = Number.isFinite(index) ? Math.round(index) : 1;
    return Math.min(manifest.frameCount, Math.max(1, finite));
  }

  function closeFrame(decoded: DecodedJawFrame): void {
    if (closedFrames.has(decoded)) return;
    closedFrames.add(decoded);
    decoded.close();
  }

  function protectedIndexes(): ReadonlySet<number> {
    return new Set([
      clampFrame(manifest.startFrame),
      clampFrame(manifest.endFrame),
      target,
      clampFrame(target - 1),
      clampFrame(target + 1),
    ]);
  }

  function evictToLimit(): void {
    const protectedSet = protectedIndexes();
    while (cache.size > cacheLimit) {
      const candidate = [...cache.entries()]
        .filter(([index]) => !protectedSet.has(index))
        .sort(([leftIndex, left], [rightIndex, right]) => left.usedAt - right.usedAt || leftIndex - rightIndex)[0];
      if (!candidate) break;
      const [index, entry] = candidate;
      cache.delete(index);
      closeFrame(entry.frame);
    }
  }

  function notify(): void {
    for (const listener of [...listeners]) {
      try {
        listener();
      } catch (error) {
        console.error("jaw sequence listener failed", error);
      }
    }
  }

  function launch(index: number): void {
    if (disposed || !visible || cache.has(index) || pending.has(index)) return;
    const manifestFrame = frameByIndex.get(index);
    if (!manifestFrame) return;

    const entry: PendingEntry = { controller: new AbortController() };
    pending.set(index, entry);

    let decoding: Promise<DecodedJawFrame>;
    try {
      decoding = decode(manifestFrame.url, entry.controller.signal);
    } catch {
      pending.delete(index);
      return;
    }

    void Promise.resolve(decoding).then(
      (decoded) => {
        const accepted =
          !disposed &&
          !entry.controller.signal.aborted &&
          pending.get(index) === entry &&
          priority.includes(index) &&
          decoded.index === index;

        if (pending.get(index) === entry) pending.delete(index);
        if (!accepted || cache.has(index)) {
          closeFrame(decoded);
          return;
        }

        cache.set(index, { frame: decoded, usedAt: ++clock });
        evictToLimit();
        notify();
      },
      () => {
        if (pending.get(index) === entry) pending.delete(index);
      },
    );
  }

  function abortPendingOutside(nextPriority: ReadonlySet<number>): void {
    for (const [index, entry] of [...pending]) {
      if (nextPriority.has(index)) continue;
      pending.delete(index);
      entry.controller.abort();
    }
  }

  function abortAllPending(): void {
    for (const [index, entry] of [...pending]) {
      pending.delete(index);
      entry.controller.abort();
    }
  }

  function pump(): void {
    if (disposed || !visible) return;
    for (const index of priority) launch(index);
  }

  function setTarget(index: number, direction: -1 | 0 | 1): void {
    if (disposed) return;
    target = clampFrame(index);
    const ordered =
      direction === 1
        ? [target, target + 1, target - 1]
        : direction === -1
          ? [target, target - 1, target + 1]
          : [target, target - 1, target + 1];
    priority = [...new Set(ordered.map(clampFrame))];
    abortPendingOutside(new Set(priority));
    evictToLimit();
    pump();
  }

  function touch(entry: CacheEntry): DecodedJawFrame {
    entry.usedAt = ++clock;
    return entry.frame;
  }

  function getExact(index: number): DecodedJawFrame | undefined {
    const entry = cache.get(clampFrame(index));
    return entry ? touch(entry) : undefined;
  }

  function getNearest(index: number): DecodedJawFrame | undefined {
    const normalized = clampFrame(index);
    const nearest = [...cache.entries()].sort(
      ([leftIndex], [rightIndex]) =>
        Math.abs(leftIndex - normalized) - Math.abs(rightIndex - normalized) || leftIndex - rightIndex,
    )[0];
    return nearest ? touch(nearest[1]) : undefined;
  }

  function subscribe(listener: () => void): () => void {
    if (disposed) return () => undefined;
    listeners.add(listener);
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      listeners.delete(listener);
    };
  }

  function setVisible(nextVisible: boolean): void {
    if (disposed || visible === nextVisible) return;
    visible = nextVisible;
    if (!visible) {
      abortAllPending();
      return;
    }
    pump();
  }

  function inspect() {
    return { decoded: cache.size, pending: pending.size, target } as const;
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    abortAllPending();
    for (const entry of cache.values()) closeFrame(entry.frame);
    cache.clear();
    listeners.clear();
  }

  return { setTarget, getExact, getNearest, subscribe, setVisible, inspect, dispose };
}

export function createBrowserJawFrameDecoder(
  manifest: JawSequenceManifest,
): BrowserJawFrameDecoder {
  const indexByUrl = new Map(manifest.frames.map((item) => [item.url, item.index]));
  const blobByUrl = new Map<string, Promise<Blob>>();

  const fetchBlob = (url: string): Promise<Blob> => {
    const cached = blobByUrl.get(url);
    if (cached) return cached;

    const request = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`jaw frame ${url} failed: ${response.status}`);
      return response.blob();
    });
    blobByUrl.set(url, request);
    void request.catch(() => {
      if (blobByUrl.get(url) === request) blobByUrl.delete(url);
    });
    return request;
  };

  const decode: BrowserJawFrameDecoder = Object.assign(async (url: string, signal: AbortSignal) => {
    if (typeof window === "undefined") throw new Error("jaw frame decoding requires a browser");
    const index = indexByUrl.get(url);
    if (index === undefined) throw new Error(`jaw frame URL is absent from manifest: ${url}`);
    throwIfAborted(signal);

    // Scroll direction changes cancel decoding, not network transfer. Keeping one
    // shared Blob promise per URL prevents touch momentum from refetching frames.
    const blob = await fetchBlob(url);
    throwIfAborted(signal);

    const bitmapDecoder = window.createImageBitmap;
    if (typeof bitmapDecoder === "function") {
      try {
        const bitmap = await waitForAbortable(window.createImageBitmap(blob), signal, (lateBitmap) => lateBitmap.close());
        return { index, source: bitmap, close: closeOnce(() => bitmap.close()) };
      } catch (error) {
        if (signal.aborted || (error instanceof Error && error.name === "AbortError")) throw error;
      }
    }

    throwIfAborted(signal);
    const objectUrl = window.URL.createObjectURL(blob);
    let revoked = false;
    let image: HTMLImageElement | undefined;
    const revoke = () => {
      if (revoked) return;
      revoked = true;
      window.URL.revokeObjectURL(objectUrl);
    };
    const clearImage = () => {
      if (image) image.src = "";
    };

    try {
      image = new window.Image();
      image.src = objectUrl;
      await waitForAbortable(image.decode(), signal);
      throwIfAborted(signal);
      revoke();
      return { index, source: image, close: closeOnce(clearImage) };
    } catch (error) {
      revoke();
      clearImage();
      throw error;
    }
  }, {
    async preload(): Promise<void> {
      if (typeof window === "undefined") return;
      const urls = manifest.frames.map((frame) => frame.url);
      let cursor = 0;
      const workerCount = Math.min(4, urls.length);
      const worker = async () => {
        while (cursor < urls.length) {
          const url = urls[cursor];
          cursor += 1;
          await fetchBlob(url);
        }
      };
      await Promise.all(Array.from({ length: workerCount }, worker));
    },
  });

  return decode;
}
