import { afterEach, describe, expect, it } from "vitest";
import { getReminderSchedule, getWebinarDetails } from "./webinar";

describe("getReminderSchedule", () => {
  afterEach(() => {
    delete process.env.WEBINAR_START_AT_ISO;
  });

  it("derives display labels from the configured webinar start time", () => {
    process.env.WEBINAR_START_AT_ISO = "2030-01-06T05:30:00.000Z";

    const webinar = getWebinarDetails();

    expect(webinar.dateLabel).toBe("Sunday 6 January");
    expect(webinar.timeLabel).toBe("11:00 AM IST");
  });

  it("returns four webinar reminder stages before the session starts", () => {
    const schedule = getReminderSchedule(new Date("2030-01-06T05:30:00.000Z"));

    expect(schedule.map((item) => [item.templateKey, item.scheduledFor.toISOString()])).toEqual([
      ["two_days_before", "2030-01-04T05:30:00.000Z"],
      ["one_day_before", "2030-01-05T04:30:00.000Z"],
      ["one_hour_before", "2030-01-06T04:30:00.000Z"],
      ["fifteen_minutes_before", "2030-01-06T05:15:00.000Z"],
    ]);
  });
});
