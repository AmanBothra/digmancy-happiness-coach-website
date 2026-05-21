import { describe, expect, it } from "vitest";
import {
  formatWebinarDateLabel,
  getCurrentYearInIst,
  getNextSaturdayWebinarDate,
} from "./webinar-date";

describe("webinar date helpers", () => {
  it("formats the label without relying on locale punctuation", () => {
    const webinarDate = new Date("2026-05-23T05:30:00.000Z");

    expect(formatWebinarDateLabel(webinarDate)).toBe("Saturday 23 May");
  });

  it("returns the next Saturday at 11:00 AM IST", () => {
    const webinarDate = getNextSaturdayWebinarDate(new Date("2026-05-20T06:30:00.000Z"));

    expect(webinarDate.toISOString()).toBe("2026-05-23T05:30:00.000Z");
    expect(formatWebinarDateLabel(webinarDate)).toBe("Saturday 23 May");
  });

  it("preserves the existing next-Saturday behavior on Saturdays", () => {
    const webinarDate = getNextSaturdayWebinarDate(new Date("2026-05-23T04:30:00.000Z"));

    expect(webinarDate.toISOString()).toBe("2026-05-30T05:30:00.000Z");
  });

  it("uses the IST calendar year", () => {
    expect(getCurrentYearInIst(new Date("2026-12-31T20:00:00.000Z"))).toBe(2027);
  });
});
