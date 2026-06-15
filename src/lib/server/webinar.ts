const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DEFAULT_WEBINAR_HOUR_IST = 10;
const DEFAULT_WEBINAR_MINUTE_IST = 30;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type WebinarDetails = {
  startAt: Date;
  dateLabel: string;
  timeLabel: string;
  joiningLink: string;
};

export type ReminderSchedule = {
  templateKey: "two_days_before" | "one_day_before" | "one_hour_before";
  scheduledFor: Date;
};

export function getWebinarDetails(from = new Date()): WebinarDetails {
  const startAt = getConfiguredWebinarStart(from);

  return {
    startAt,
    dateLabel: process.env.WEBINAR_DISPLAY_DATE || formatIstDate(startAt),
    timeLabel:
      process.env.WEBINAR_DISPLAY_TIME ||
      formatIstTime(DEFAULT_WEBINAR_HOUR_IST, DEFAULT_WEBINAR_MINUTE_IST),
    joiningLink: process.env.WEBINAR_JOINING_LINK || "Joining link will be shared soon.",
  };
}

export function getReminderSchedule(startAt: Date): ReminderSchedule[] {
  const { year, month, day } = getIstParts(startAt);

  return [
    {
      templateKey: "two_days_before",
      scheduledFor: istToUtcDate(year, month, day - 2, 11, 0),
    },
    {
      templateKey: "one_day_before",
      scheduledFor: istToUtcDate(year, month, day - 1, 10, 0),
    },
    {
      templateKey: "one_hour_before",
      scheduledFor: new Date(startAt.getTime() - 60 * 60 * 1000),
    },
  ];
}

function getConfiguredWebinarStart(from: Date) {
  const configured = process.env.WEBINAR_START_AT_ISO;
  if (configured) {
    const parsed = new Date(configured);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("WEBINAR_START_AT_ISO must be a valid ISO timestamp");
    }
    return parsed;
  }

  return getNextSundayAtDefaultTime(from);
}

function getNextSundayAtDefaultTime(from: Date) {
  const { year, month, day, weekday } = getIstParts(from);
  const daysUntilSunday = (7 - weekday) % 7;
  const targetDate = istToUtcDate(
    year,
    month,
    day + daysUntilSunday,
    DEFAULT_WEBINAR_HOUR_IST,
    DEFAULT_WEBINAR_MINUTE_IST,
  );

  if (weekday === 0 && from.getTime() >= targetDate.getTime()) {
    return istToUtcDate(
      year,
      month,
      day + 7,
      DEFAULT_WEBINAR_HOUR_IST,
      DEFAULT_WEBINAR_MINUTE_IST,
    );
  }

  return targetDate;
}

function getIstParts(date: Date) {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);

  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    day: istDate.getUTCDate(),
    weekday: istDate.getUTCDay(),
    hour: istDate.getUTCHours(),
    minute: istDate.getUTCMinutes(),
  };
}

function istToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  return new Date(Date.UTC(year, month, day, hour, minute, 0, 0) - IST_OFFSET_MS);
}

function formatIstDate(date: Date) {
  const { month, day, weekday } = getIstParts(date);
  return `${WEEKDAYS[weekday]} ${day} ${MONTHS[month]}`;
}

function formatIstTime(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const minuteText = String(minute).padStart(2, "0");
  return `${hour12}:${minuteText} ${suffix} IST`;
}
