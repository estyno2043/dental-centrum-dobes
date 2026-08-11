import { describe, expect, test, vi } from "vitest";
import { createLatestSeekQueue, type SeekVideo } from "./jawSeekQueue";

class FakeVideo implements SeekVideo {
  readyState = 1;
  duration = 2;
  seeking = false;
  private time = 0;
  private listeners = new Map<string, () => void>();
  private frameCallback: VideoFrameRequestCallback | null = null;
  callbackRegisteredAtSeek = false;

  get currentTime() {
    return this.time;
  }

  set currentTime(value: number) {
    this.callbackRegisteredAtSeek = this.frameCallback !== null;
    this.time = value;
    this.seeking = true;
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.listeners.set(type, listener as () => void);
  }

  removeEventListener(type: string) {
    this.listeners.delete(type);
  }

  requestVideoFrameCallback(callback: VideoFrameRequestCallback) {
    this.frameCallback = callback;
    return 1;
  }

  finishSeek() {
    this.seeking = false;
    const listener = this.listeners.get("seeked");
    this.listeners.delete("seeked");
    listener?.();
  }

  paint(mediaTime = this.currentTime) {
    const callback = this.frameCallback;
    this.frameCallback = null;
    callback?.(0, { mediaTime } as VideoFrameCallbackMetadata);
  }
}

describe("createLatestSeekQueue", () => {
  test("keeps only newest target while one seek is pending", () => {
    const video = new FakeVideo();
    const displayed: number[] = [];
    const queue = createLatestSeekQueue(video, (time) => displayed.push(time));

    queue.request(0.4);
    queue.request(1.7);
    queue.request(0.2);

    expect(queue.inspect()).toEqual({ inFlight: true, pendingTarget: 0.2 });
    expect(video.currentTime).toBe(0.4);

    video.finishSeek();
    video.paint(0.4);

    expect(displayed).toEqual([0.4]);
    expect(video.currentTime).toBe(0.2);
    expect(queue.inspect().inFlight).toBe(true);

    video.finishSeek();
    video.paint(0.2);
    expect(displayed).toEqual([0.4, 0.2]);
    expect(queue.inspect()).toEqual({ inFlight: false, pendingTarget: null });
  });

  test("reports decoded media time, not requested scroll time", () => {
    const video = new FakeVideo();
    const onDisplayed = vi.fn();
    const queue = createLatestSeekQueue(video, onDisplayed);

    queue.request(1.25);
    video.finishSeek();
    video.paint(1.2333);

    expect(onDisplayed).toHaveBeenCalledWith(1.2333);
  });

  test("registers frame callback before changing currentTime", () => {
    const video = new FakeVideo();
    const queue = createLatestSeekQueue(video, vi.fn());

    queue.request(1.25);

    expect(video.callbackRegisteredAtSeek).toBe(true);
  });

  test("supports forward jump, reverse jump and cancellation", () => {
    const video = new FakeVideo();
    const queue = createLatestSeekQueue(video, vi.fn());

    queue.request(1.8);
    queue.request(0.1);
    expect(queue.inspect().pendingTarget).toBe(0.1);

    queue.cancel();
    video.finishSeek();
    video.paint(1.8);
    expect(queue.inspect()).toEqual({ inFlight: false, pendingTarget: null });
  });

  test("does not deadlock on a sub-frame request after first decoded frame", () => {
    const video = new FakeVideo();
    const onDisplayed = vi.fn();
    const queue = createLatestSeekQueue(video, onDisplayed);

    queue.request(0);
    video.paint(0);
    queue.request(0.005);

    expect(queue.inspect()).toEqual({ inFlight: false, pendingTarget: null });
    expect(onDisplayed).toHaveBeenLastCalledWith(0);
  });
});
