import { describe, expect, it } from "vitest";
import { normalizeIndianMobile } from "./phone";

describe("normalizeIndianMobile", () => {
  it("adds country code 91 to a 10 digit mobile number", () => {
    expect(normalizeIndianMobile("7976744549")).toBe("917976744549");
  });

  it("keeps an existing 91 country code without duplicating it", () => {
    expect(normalizeIndianMobile("917976744549")).toBe("917976744549");
    expect(normalizeIndianMobile("+91 79767 44549")).toBe("917976744549");
  });

  it("normalizes a leading local zero", () => {
    expect(normalizeIndianMobile("07976744549")).toBe("917976744549");
  });

  it("rejects numbers that cannot be normalized to 91 plus 10 digits", () => {
    expect(normalizeIndianMobile("12345")).toBe("");
  });
});
