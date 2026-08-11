export type SeekVideo = Pick<
  HTMLVideoElement,
  | "readyState"
  | "duration"
  | "seeking"
  | "currentTime"
  | "addEventListener"
  | "removeEventListener"
  | "requestVideoFrameCallback"
>;

export type LatestSeekQueue = Readonly<{
  request: (localTime: number) => void;
  cancel: () => void;
  inspect: () => Readonly<{
    inFlight: boolean;
    pendingTarget: number | null;
  }>;
}>;

export type SeekQueueSnapshot = Readonly<{
  phase: string;
  inFlight: boolean;
  pendingTarget: number | null;
  currentTime: number;
}>;

const FRAME_TOLERANCE = 1 / 30;

export function createLatestSeekQueue(
  video: SeekVideo,
  onDisplayed: (mediaTime: number) => void,
  onStateChange?: (snapshot: SeekQueueSnapshot) => void,
): LatestSeekQueue {
  let inFlight = false;
  let pendingTarget: number | null = null;
  let generation = 0;
  let hasDecodedFrame = false;
  let activePhase = "idle";

  const emit = (phase: string) => {
    if (phase !== "queued-latest") activePhase = phase;
    onStateChange?.({
      phase: phase === "queued-latest" ? `${activePhase}+queued` : phase,
      inFlight,
      pendingTarget,
      currentTime: video.currentTime,
    });
  };

  const begin = (requestedTime: number) => {
    const token = generation;
    const duration = Number.isFinite(video.duration)
      ? Math.max(0, video.duration - 0.001)
      : requestedTime;
    const target = Math.min(Math.max(0, requestedTime), duration);
    inFlight = true;
    emit("begin");

    const decoded = (metadata?: VideoFrameCallbackMetadata) => {
      if (token !== generation) {
        inFlight = false;
        pendingTarget = null;
        return;
      }

      const displayedTime = metadata?.mediaTime ?? video.currentTime;
      hasDecodedFrame = true;
      onDisplayed(displayedTime);
      inFlight = false;
      emit("decoded");

      const next = pendingTarget;
      pendingTarget = null;
      if (next !== null && Math.abs(next - displayedTime) > FRAME_TOLERANCE) {
        begin(next);
      }
    };

    const waitForFrame = () => {
      if (typeof video.requestVideoFrameCallback === "function") {
        emit("waiting-frame");
        video.requestVideoFrameCallback((_now, metadata) => {
          if (
            token === generation &&
            Math.abs(metadata.mediaTime - target) > FRAME_TOLERANCE
          ) {
            waitForFrame();
            return;
          }
          decoded(metadata);
        });
      } else {
        decoded();
      }
    };

    const seek = () => {
      if (Math.abs(video.currentTime - target) <= FRAME_TOLERANCE) {
        if (hasDecodedFrame) {
          onDisplayed(video.currentTime);
          inFlight = false;
          emit("same-frame");
          return;
        }
        waitForFrame();
        return;
      }

      if (typeof video.requestVideoFrameCallback === "function") {
        waitForFrame();
        video.currentTime = target;
        emit("waiting-target-frame");
        return;
      }

      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        emit("seeked-fallback");
        decoded();
      };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = target;
      emit("waiting-seeked-fallback");
    };

    if (video.readyState >= 1) {
      seek();
      return;
    }

    const onMetadata = () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      seek();
    };
    video.addEventListener("loadedmetadata", onMetadata);
    emit("waiting-metadata");
  };

  return {
    request(localTime) {
      if (inFlight) {
        pendingTarget = localTime;
        emit("queued-latest");
        return;
      }
      begin(localTime);
    },
    cancel() {
      generation += 1;
      pendingTarget = null;
      inFlight = false;
      emit("cancelled");
    },
    inspect() {
      return { inFlight, pendingTarget };
    },
  };
}
