import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { BACKDROP_ATTRIBUTE, SERVICE_PHOTO } from "./serviceTransition";

const pageSource = readFileSync("app/sluzby/[sluzba]/page.tsx", "utf8");
const pageCss = readFileSync("app/sluzby/[sluzba]/service.module.css", "utf8");
const constantsSource = readFileSync(
  "components/services/serviceTransition.ts",
  "utf8",
);

describe("service photo transition", () => {
  /*
   * Both ends have to agree on one name, and two things have broken that.
   *
   * CSS Modules scopes the *value* of `view-transition-name` exactly as it
   * scopes class names, so declaring it in the stylesheet turned it into a
   * hash that the script-set name on the card could never match. The morph
   * then simply does not happen, and nothing anywhere reports it.
   */
  it("sets the transition name inline rather than through the stylesheet", () => {
    expect(pageCss).not.toMatch(/view-transition-name/);
    expect(pageSource).toMatch(/viewTransitionName:\s*SERVICE_PHOTO/);
  });

  /*
   * And the constants must not live in a client module. A value exported from
   * one reaches a server component as a client *reference*, so spreading it as
   * an attribute name produced an attribute named after the proxy's own error
   * message — which React duly tried to render.
   */
  it("keeps the shared names out of a client module", () => {
    // Anchored to a real directive: the file's own comment says the words
    // "use client" while explaining why they are not there.
    const firstStatement = constantsSource
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .trim();
    expect(firstStatement).not.toMatch(/^["']use client["']/);
    expect(pageSource).toMatch(
      /from "@\/components\/services\/serviceTransition"/,
    );
  });

  it("names the thing the incoming page is recognised by", () => {
    expect(BACKDROP_ATTRIBUTE).toMatch(/^data-/);
    expect(pageSource).toContain("BACKDROP_ATTRIBUTE");
    expect(SERVICE_PHOTO).toBeTruthy();
  });
});
