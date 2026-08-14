import { afterEach, describe, expect, it, vi } from "vitest";

import type { JawSequenceManifest } from "./jawSequenceManifest.generated";
import {
  createBrowserJawFrameDecoder,
  createJawSequenceLoader,
  type DecodedJawFrame,
} from "./jawSequenceLoader";

const originalBrowserDescriptors = {
  createImageBitmap: Object.getOwnPropertyDescriptor(window, "createImageBitmap"),
  Image: Object.getOwnPropertyDescriptor(window, "Image"),
  createObjectURL: Object.getOwnPropertyDescriptor(window.URL, "createObjectURL"),
  revokeObjectURL: Object.getOwnPropertyDescriptor(window.URL, "revokeObjectURL"),
};

type Deferred<T> = Readonly<{
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}>;

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function manifest(frameCount = 50): JawSequenceManifest {
  return {
    profile: "desktop",
    width: 1280,
    height: 720,
    frameCount,
    totalBytes: frameCount,
    startFrame: 1,
    endFrame: frameCount,
    frames: Array.from({ length: frameCount }, (_, offset) => ({
      index: offset + 1,
      url: `/jaw/custom-${offset + 1}.webp`,
      bytes: 1,
      sha256: `${offset + 1}`.padStart(64, "0"),
    })),
  };
}

function frame(index: number, close = vi.fn()): DecodedJawFrame {
  return {
    index,
    source: document.createElement("canvas"),
    close,
  };
}

function indexFromUrl(url: string): number {
  const match = url.match(/custom-(\d+)\.webp$/);
  if (!match) throw new Error(`unexpected test URL: ${url}`);
  return Number(match[1]);
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  restoreProperty(window, "createImageBitmap", originalBrowserDescriptors.createImageBitmap);
  restoreProperty(window, "Image", originalBrowserDescriptors.Image);
  restoreProperty(window.URL, "createObjectURL", originalBrowserDescriptors.createObjectURL);
  restoreProperty(window.URL, "revokeObjectURL", originalBrowserDescriptors.revokeObjectURL);
});

function restoreProperty(
  target: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
    return;
  }
  Reflect.deleteProperty(target, key);
}

describe("createJawSequenceLoader", () => {
  it("clamps one-based targets and launches the direction-aware three-frame window in manifest URL order", () => {
    const calls: { index: number; signal: AbortSignal }[] = [];
    const decode = vi.fn((url: string, signal: AbortSignal) => {
      calls.push({ index: indexFromUrl(url), signal });
      return new Promise<DecodedJawFrame>(() => undefined);
    });
    const loader = createJawSequenceLoader({ manifest: manifest(), cacheLimit: 12, decode });

    loader.setTarget(10, 1);
    expect(calls.map(({ index }) => index)).toEqual([10, 11, 9]);

    loader.setTarget(40, 1);
    expect(calls.slice(3).map(({ index }) => index)).toEqual([40, 41, 39]);
    expect(calls.slice(0, 3).every(({ signal }) => signal.aborted)).toBe(true);
    expect(loader.inspect()).toEqual({ decoded: 0, pending: 3, target: 40 });

    loader.setTarget(20, -1);
    expect(calls.slice(6).map(({ index }) => index)).toEqual([20, 19, 21]);
    expect(loader.inspect().pending).toBeLessThanOrEqual(3);

    loader.setTarget(-50, 0);
    expect(loader.inspect().target).toBe(1);
    expect(calls.slice(-2).map(({ index }) => index)).toEqual([1, 2]);

    loader.setTarget(500, 0);
    expect(loader.inspect().target).toBe(50);
    expect(calls.slice(-2).map(({ index }) => index)).toEqual([50, 49]);

    loader.setTarget(Number.POSITIVE_INFINITY, 0);
    expect(loader.inspect().target).toBe(50);
    loader.setTarget(Number.NEGATIVE_INFINITY, 0);
    expect(loader.inspect().target).toBe(1);
    loader.setTarget(Number.NaN, 0);
    expect(loader.inspect().target).toBe(1);
    loader.dispose();
  });

  it("rejects cache limits that are invalid or smaller than the maximum protected set", () => {
    const decode = async () => frame(1);

    for (const cacheLimit of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 4]) {
      expect(() => createJawSequenceLoader({ manifest: manifest(10), cacheLimit, decode })).toThrow(
        "jaw sequence cacheLimit must be an integer of at least 5",
      );
    }

    expect(() => createJawSequenceLoader({ manifest: manifest(3), cacheLimit: 3, decode })).not.toThrow();
  });

  it("deduplicates pending and cached targets", async () => {
    const pending = new Map<number, Deferred<DecodedJawFrame>>();
    const decode = vi.fn((url: string) => {
      const index = indexFromUrl(url);
      const task = deferred<DecodedJawFrame>();
      pending.set(index, task);
      return task.promise;
    });
    const loader = createJawSequenceLoader({ manifest: manifest(10), cacheLimit: 5, decode });

    loader.setTarget(5, 0);
    loader.setTarget(5, 0);
    expect(decode).toHaveBeenCalledTimes(3);
    pending.get(5)?.resolve(frame(5));
    await flushPromises();

    loader.setTarget(5, 0);
    expect(decode).toHaveBeenCalledTimes(3);
    loader.dispose();
  });

  it("keeps endpoints and current neighbors while enforcing the hard cache cap", async () => {
    const closes = new Map<number, ReturnType<typeof vi.fn>>();
    const decode = vi.fn(async (url: string) => {
      const index = indexFromUrl(url);
      const close = vi.fn();
      closes.set(index, close);
      return frame(index, close);
    });
    const loader = createJawSequenceLoader({ manifest: manifest(10), cacheLimit: 5, decode });

    loader.setTarget(1, 1);
    await flushPromises();
    loader.setTarget(10, -1);
    await flushPromises();
    loader.setTarget(5, 0);
    await flushPromises();

    expect(loader.inspect().decoded).toBe(5);
    expect(loader.getExact(1)?.index).toBe(1);
    expect(loader.getExact(10)?.index).toBe(10);
    expect(loader.getExact(4)?.index).toBe(4);
    expect(loader.getExact(5)?.index).toBe(5);
    expect(loader.getExact(6)?.index).toBe(6);
    expect(closes.get(2)).toHaveBeenCalledTimes(1);
    expect(closes.get(9)).toHaveBeenCalledTimes(1);

    loader.dispose();
    for (const close of closes.values()) expect(close).toHaveBeenCalledTimes(1);
  });

  it("returns nearest decoded frame with lower-index tie break and keeps cached reads live while hidden", async () => {
    const tasks = new Map<number, Deferred<DecodedJawFrame>>();
    const decode = vi.fn((url: string) => {
      const index = indexFromUrl(url);
      const task = deferred<DecodedJawFrame>();
      tasks.set(index, task);
      return task.promise;
    });
    const loader = createJawSequenceLoader({ manifest: manifest(10), cacheLimit: 5, decode });

    loader.setTarget(5, 0);
    tasks.get(4)?.resolve(frame(4));
    tasks.get(6)?.resolve(frame(6));
    await flushPromises();
    loader.setVisible(false);

    expect(loader.getNearest(5)?.index).toBe(4);
    expect(loader.getExact(4)?.index).toBe(4);
    const callsBeforeHiddenTarget = decode.mock.calls.length;
    loader.setTarget(8, 1);
    expect(decode).toHaveBeenCalledTimes(callsBeforeHiddenTarget);

    loader.setVisible(true);
    expect(decode.mock.calls.slice(callsBeforeHiddenTarget).map(([url]) => indexFromUrl(url))).toEqual([8, 9, 7]);
    loader.dispose();
  });

  it("notifies each active subscriber once per accepted frame and makes unsubscribe idempotent", async () => {
    const tasks = new Map<number, Deferred<DecodedJawFrame>>();
    const decode = (url: string) => {
      const index = indexFromUrl(url);
      const task = deferred<DecodedJawFrame>();
      tasks.set(index, task);
      return task.promise;
    };
    const loader = createJawSequenceLoader({ manifest: manifest(10), cacheLimit: 5, decode });
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = loader.subscribe(first);
    loader.subscribe(second);

    loader.setTarget(5, 0);
    tasks.get(5)?.resolve(frame(5));
    await flushPromises();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    unsubscribeFirst();
    tasks.get(4)?.resolve(frame(4));
    await flushPromises();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    loader.dispose();
  });

  it("closes stale and disposed late results exactly once without caching or notifying", async () => {
    const tasks = new Map<number, Deferred<DecodedJawFrame>>();
    const decode = (url: string) => {
      const index = indexFromUrl(url);
      const task = deferred<DecodedJawFrame>();
      tasks.set(index, task);
      return task.promise;
    };
    const loader = createJawSequenceLoader({ manifest: manifest(), cacheLimit: 12, decode });
    const listener = vi.fn();
    loader.subscribe(listener);

    loader.setTarget(10, 1);
    loader.setTarget(40, 1);
    const staleClose = vi.fn();
    tasks.get(10)?.resolve(frame(10, staleClose));
    await flushPromises();
    expect(staleClose).toHaveBeenCalledTimes(1);
    expect(loader.getExact(10)).toBeUndefined();
    expect(listener).not.toHaveBeenCalled();

    loader.dispose();
    const disposedClose = vi.fn();
    tasks.get(40)?.resolve(frame(40, disposedClose));
    await flushPromises();
    expect(disposedClose).toHaveBeenCalledTimes(1);
    expect(listener).not.toHaveBeenCalled();
    expect(loader.inspect()).toEqual({ decoded: 0, pending: 0, target: 40 });
  });

  it("handles decode rejection without an unhandled rejection and permits retry", async () => {
    const decode = vi
      .fn<(url: string, signal: AbortSignal) => Promise<DecodedJawFrame>>()
      .mockRejectedValueOnce(new Error("decode failed"))
      .mockResolvedValueOnce(frame(1));
    const loader = createJawSequenceLoader({ manifest: manifest(1), cacheLimit: 1, decode });

    loader.setTarget(1, 0);
    await flushPromises();
    expect(loader.inspect()).toEqual({ decoded: 0, pending: 0, target: 1 });

    loader.setTarget(1, 0);
    await flushPromises();
    expect(decode).toHaveBeenCalledTimes(2);
    expect(loader.getExact(1)?.index).toBe(1);
    loader.dispose();
  });

  it("closes every accepted frame exactly once across eviction and repeated disposal", async () => {
    const closes: ReturnType<typeof vi.fn>[] = [];
    const decode = async (url: string) => {
      const close = vi.fn();
      closes.push(close);
      return frame(indexFromUrl(url), close);
    };
    const loader = createJawSequenceLoader({ manifest: manifest(8), cacheLimit: 5, decode });

    for (const target of [1, 4, 8]) {
      loader.setTarget(target, 1);
      await flushPromises();
    }
    expect(loader.inspect().decoded).toBeLessThanOrEqual(5);
    loader.dispose();
    loader.dispose();

    for (const close of closes) expect(close).toHaveBeenCalledTimes(1);
  });
});

describe("createBrowserJawFrameDecoder", () => {
  function response(blob = new Blob(["webp"]), status = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      blob: vi.fn().mockResolvedValue(blob),
    } as unknown as Response;
  }

  it("is SSR-safe to create and rejects only when invoked without browser APIs", async () => {
    vi.stubGlobal("window", undefined);
    const decoder = createBrowserJawFrameDecoder(manifest(1));

    await expect(decoder("/jaw/custom-1.webp", new AbortController().signal)).rejects.toThrow(
      "jaw frame decoding requires a browser",
    );
  });

  it("uses the manifest URL to recover one-based index and closes ImageBitmap exactly once", async () => {
    const bitmap = { close: vi.fn() } as unknown as ImageBitmap;
    const fetchMock = vi.fn().mockResolvedValue(response());
    const bitmapMock = vi.fn().mockResolvedValue(bitmap);
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "createImageBitmap", { configurable: true, value: bitmapMock });

    const decoder = createBrowserJawFrameDecoder(manifest(2));
    const controller = new AbortController();
    const decoded = await decoder("/jaw/custom-2.webp", controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/jaw/custom-2.webp", { signal: controller.signal });
    expect(decoded.index).toBe(2);
    expect(decoded.source).toBe(bitmap);
    decoded.close();
    decoded.close();
    expect(bitmap.close).toHaveBeenCalledTimes(1);
  });

  it("rejects URLs absent from the manifest without fetching or guessing a filename", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const decoder = createBrowserJawFrameDecoder(manifest(2));

    await expect(decoder("/jaw/frame-002.webp", new AbortController().signal)).rejects.toThrow(
      "jaw frame URL is absent from manifest: /jaw/frame-002.webp",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports HTTP failures before blob decode", async () => {
    const failed = response(new Blob(), 503);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(failed));
    const decoder = createBrowserJawFrameDecoder(manifest(1));

    await expect(decoder("/jaw/custom-1.webp", new AbortController().signal)).rejects.toThrow(
      "jaw frame /jaw/custom-1.webp failed: 503",
    );
    expect(failed.blob).not.toHaveBeenCalled();
  });

  it("closes a bitmap that resolves after abort and rejects with AbortError", async () => {
    const task = deferred<ImageBitmap>();
    const bitmap = { close: vi.fn() } as unknown as ImageBitmap;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
    Object.defineProperty(window, "createImageBitmap", { configurable: true, value: vi.fn(() => task.promise) });
    const decoder = createBrowserJawFrameDecoder(manifest(1));
    const controller = new AbortController();

    const decoding = decoder("/jaw/custom-1.webp", controller.signal);
    await flushPromises();
    controller.abort();
    await expect(decoding).rejects.toMatchObject({ name: "AbortError" });
    task.resolve(bitmap);
    await flushPromises();
    expect(bitmap.close).toHaveBeenCalledTimes(1);
  });

  it("falls back after bitmap decode failure and revokes the object URL on success", async () => {
    const images: FakeImage[] = [];
    class FakeImage {
      src = "";
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        images.push(this);
      }
    }
    const createObjectURL = vi.fn().mockReturnValue("blob:jaw-success");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
    Object.defineProperty(window, "createImageBitmap", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("bitmap unsupported for WebP")),
    });
    Object.defineProperty(window, "Image", { configurable: true, value: FakeImage });
    Object.defineProperty(window.URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });

    const decoded = await createBrowserJawFrameDecoder(manifest(1))(
      "/jaw/custom-1.webp",
      new AbortController().signal,
    );
    expect(decoded.source).toBe(images[0]);
    expect(images[0]?.src).toBe("blob:jaw-success");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:jaw-success");
    decoded.close();
    decoded.close();
    expect(images[0]?.src).toBe("");
  });

  it("cleans fallback image and object URL on decode error", async () => {
    const images: FakeImage[] = [];
    class FakeImage {
      src = "";
      decode = vi.fn().mockRejectedValue(new Error("image decode failed"));
      constructor() {
        images.push(this);
      }
    }
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
    Object.defineProperty(window, "createImageBitmap", { configurable: true, value: undefined });
    Object.defineProperty(window, "Image", { configurable: true, value: FakeImage });
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("blob:jaw-error"),
    });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });

    await expect(
      createBrowserJawFrameDecoder(manifest(1))("/jaw/custom-1.webp", new AbortController().signal),
    ).rejects.toThrow("image decode failed");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:jaw-error");
    expect(images[0]?.src).toBe("");
  });

  it("cleans fallback image on abort and consumes its late decode settlement", async () => {
    const task = deferred<void>();
    const images: FakeImage[] = [];
    class FakeImage {
      src = "";
      decode = vi.fn(() => task.promise);
      constructor() {
        images.push(this);
      }
    }
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
    Object.defineProperty(window, "createImageBitmap", { configurable: true, value: undefined });
    Object.defineProperty(window, "Image", { configurable: true, value: FakeImage });
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("blob:jaw-abort"),
    });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const controller = new AbortController();

    const decoding = createBrowserJawFrameDecoder(manifest(1))("/jaw/custom-1.webp", controller.signal);
    await flushPromises();
    controller.abort();
    await expect(decoding).rejects.toMatchObject({ name: "AbortError" });
    expect(images[0]?.src).toBe("");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:jaw-abort");
    task.reject(new Error("late decode rejection"));
    await flushPromises();
  });
});
