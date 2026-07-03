import { describe, expect, it } from "vitest";
import { getReminderSchedule } from "./webinar";

describe("getReminderSchedule", () => {
  it("returns four webinar reminder stages before the session starts", () => {
    const schedule = getReminderSchedule(new Date("2026-06-28T05:30:00.000Z"));

    expect(schedule.map((item) => [item.templateKey, item.scheduledFor.toISOString()])).toEqual([
      ["two_days_before", "2026-06-26T05:30:00.000Z"],
      ["one_day_before", "2026-06-27T04:30:00.000Z"],
      ["one_hour_before", "2026-06-28T04:30:00.000Z"],
      ["fifteen_minutes_before", "2026-06-28T05:15:00.000Z"],
    ]);
  });
});
