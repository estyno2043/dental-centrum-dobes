import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/*
 * The app router has no context outside a running Next app, and `useRouter`
 * throws rather than degrading. Anything that renders the homepage reaches it
 * now — the services catalogue asks the router to open a service page with a
 * view transition — so the stub lives here rather than in each test file.
 */
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

afterEach(cleanup);
