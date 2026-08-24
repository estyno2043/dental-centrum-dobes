/**
 * Names shared by the two ends of the service photograph's morph.
 *
 * Deliberately in a module of their own, with no `"use client"` on it. These
 * are imported by both the client hook that starts the transition and the
 * server component that renders its destination, and a constant exported from
 * a client module reaches the server as a client *reference* rather than as
 * its value — which spreads into the DOM as an attribute named after the
 * proxy's error message.
 */

/** The `view-transition-name` both ends carry. Only one element may hold it. */
export const SERVICE_PHOTO = "service-photo";

/** The incoming page marks its backdrop with this, so the hook knows it landed. */
export const BACKDROP_ATTRIBUTE = "data-service-backdrop";
