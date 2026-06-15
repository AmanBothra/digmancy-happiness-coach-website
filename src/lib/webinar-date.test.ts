import { afterEach, describe, expect, it } from "vitest";
import {
  formatWebinarDateLabel,
  getCurrentYearInIst,
  getWebinarDateDetails,
  getNextSundayWebinarDate,
} from "./webinar-date";

describe("webinar date helpers", () => {
  afterEach(() => {
    delete process.env.WEBINAR_START_AT_ISO;
    delete process.env.WEBINAR_DISPLAY_DATE;
    delete process.env.WEBINAR_DISPLAY_TIME;
  });

  it("uses configured webinar date and display labels from the environment", () => {
    process.env.WEBINAR_START_AT_ISO = "2026-06-28T05:30:00.000Z";
    process.env.WEBINAR_DISPLAY_DATE = "Sunday 28 June";
    process.env.WEBINAR_DISPLAY_TIME = "11:00 AM IST";

    const webinar = getWebinarDateDetails(new Date("2026-06-15T12:00:00.000Z"));

    expect(webinar.startAt.toISOString()).toBe("2026-06-28T05:30:00.000Z");
    expect(webinar.dateLabel).toBe("Sunday 28 June");
    expect(webinar.timeLabel).toBe("11:00 AM IST");
  });

  it("formats the label without relying on locale punctuation", () => {
    const webinarDate = new Date("2026-05-24T05:00:00.000Z");

    expect(formatWebinarDateLabel(webinarDate)).toBe("Sunday 24 May");
  });

  it("returns the next Sunday at 10:30 AM IST", () => {
    const webinarDate = getNextSundayWebinarDate(new Date("2026-05-20T06:30:00.000Z"));

    expect(webinarDate.toISOString()).toBe("2026-05-24T05:00:00.000Z");
    expect(formatWebinarDateLabel(webinarDate)).toBe("Sunday 24 May");
  });

  it("keeps the current Sunday seminar active before it ends", () => {
    const webinarDate = getNextSundayWebinarDate(new Date("2026-05-24T06:00:00.000Z"));

    expect(webinarDate.toISOString()).toBe("2026-05-24T05:00:00.000Z");
  });

  it("moves to the next Sunday only after the current seminar is complete", () => {
    const webinarDate = getNextSundayWebinarDate(new Date("2026-05-24T07:01:00.000Z"));

    expect(webinarDate.toISOString()).toBe("2026-05-31T05:00:00.000Z");
  });

  it("uses the IST calendar year", () => {
    expect(getCurrentYearInIst(new Date("2026-12-31T20:00:00.000Z"))).toBe(2027);
  });
});
