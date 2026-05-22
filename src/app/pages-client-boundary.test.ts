import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const appDir = resolve(process.cwd(), "src/app");

const routedClientFiles = [
  "page.tsx",
  "privacy-policy/page.tsx",
  "refund-policy/page.tsx",
  "terms-and-conditions/page.tsx",
  "not-found.tsx",
];

describe("app routed pages", () => {
  it.each(routedClientFiles)("keeps %s behind a client boundary", (file) => {
    const source = readFileSync(resolve(appDir, file), "utf8");

    expect(source.trimStart().startsWith('"use client";')).toBe(
      true,
      `${relative(process.cwd(), resolve(appDir, file))} must start with "use client";`,
    );
  });
});
