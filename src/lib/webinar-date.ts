const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

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
  };
};

export const getNextSaturdayWebinarDate = (from = new Date()) => {
  const { year, month, day, weekday } = getIstParts(from);
  const daysUntilSaturday = (6 - weekday + 7) % 7 || 7;
  const targetAsIst = Date.UTC(year, month, day + daysUntilSaturday, 11, 0, 0, 0);

  return new Date(targetAsIst - IST_OFFSET_MS);
};

export const formatWebinarDateLabel = (date: Date) => {
  const { month, day, weekday } = getIstParts(date);

  return `${WEEKDAYS[weekday]} ${day} ${MONTHS[month]}`;
};

export const getCurrentYearInIst = (from = new Date()) => getIstParts(from).year;
