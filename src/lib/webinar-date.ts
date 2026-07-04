const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const WEBINAR_START_HOUR_IST = 10;
const WEBINAR_START_MINUTE_IST = 30;
const WEBINAR_DURATION_MINUTES = 120;

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

const getIstParts = (date: Date) => {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);

  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    day: istDate.getUTCDate(),
    weekday: istDate.getUTCDay(),
    hour: istDate.getUTCHours(),
    minute: istDate.getUTCMinutes(),
  };
};

export type WebinarDateDetails = {
  startAt: Date;
  dateLabel: string;
  timeLabel: string;
};

export const getWebinarDateDetails = (from = new Date()): WebinarDateDetails => {
  const startAt = getConfiguredWebinarDate(from);

  return {
    startAt,
    dateLabel: formatWebinarDateLabel(startAt),
    timeLabel: formatWebinarTimeLabel(startAt),
  };
};

const getConfiguredWebinarDate = (from = new Date()) => {
  const configured = process.env.WEBINAR_START_AT_ISO;
  if (configured) {
    const parsed = new Date(configured);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("WEBINAR_START_AT_ISO must be a valid ISO timestamp");
    }
    return parsed;
  }

  return getFallbackSundayWebinarDate(from);
};

export const getNextSundayWebinarDate = (from = new Date()) => {
  return getWebinarDateDetails(from).startAt;
};

const getFallbackSundayWebinarDate = (from = new Date()) => {
  const { year, month, day, weekday } = getIstParts(from);
  const daysUntilSunday = (7 - weekday) % 7;
  const targetAsIst = Date.UTC(
    year,
    month,
    day + daysUntilSunday,
    WEBINAR_START_HOUR_IST,
    WEBINAR_START_MINUTE_IST,
    0,
    0,
  );
  const targetDate = new Date(targetAsIst - IST_OFFSET_MS);
  const webinarEndTime = targetDate.getTime() + WEBINAR_DURATION_MINUTES * 60 * 1000;

  if (weekday === 0 && from.getTime() >= webinarEndTime) {
    return new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return targetDate;
};

export const getNextSaturdayWebinarDate = getNextSundayWebinarDate;

export const formatWebinarDateLabel = (date: Date) => {
  const { month, day, weekday } = getIstParts(date);

  return `${WEEKDAYS[weekday]} ${day} ${MONTHS[month]}`;
};

export const formatWebinarTimeLabel = (date: Date) => {
  const { hour, minute } = getIstParts(date);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const minuteText = String(minute).padStart(2, "0");

  return `${hour12}:${minuteText} ${suffix} IST`;
};

export const getCurrentYearInIst = (from = new Date()) => getIstParts(from).year;
