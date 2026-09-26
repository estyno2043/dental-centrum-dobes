import { describe, expect, it, vi } from "vitest";

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("next/navigation", () => ({
  notFound,
  usePathname: () => "/ochrana-osobnych-udajov",
  useRouter: () => ({ push: vi.fn() }),
}));

import { privacyReady } from "@/components/legal/legalContent";
import PrivacyPage from "./page";

describe("privacy page", () => {
  /* Until the clinic's facts are in, the route does not exist. */
  it("answers 404 until the notice is ready", () => {
    if (privacyReady) {
      expect(() => PrivacyPage()).not.toThrow();
    } else {
      expect(() => PrivacyPage()).toThrow("NEXT_NOT_FOUND");
    }
  });
});
