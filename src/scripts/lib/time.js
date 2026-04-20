import { hebrewMonths } from "../data/hebrewMonths.js";

export function getKabbalahDateTime(date = new Date(), humanLat, humanLon) {
  const parts = new Intl.DateTimeFormat("en-u-ca-hebrew", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type).value;

  const monthName = get("month");
  const times = SunCalc.getTimes(date, humanLat, humanLon);
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const kHour = getKabbalisticHour(date, sunrise, sunset, humanLat, humanLon);

  return {
    day: Number(get("day")),
    month: hebrewMonths.indexOf(monthName)+1,
    monthName,
    year: Number(get("year")),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),
    sunrise,
    sunset,
    kabbalisticHour: kHour.hour,
    kabbalisticHourLength: kHour.hourLength,
    kabbalisticPeriod: kHour.period,
    dayLength: kHour.dayLength,
    nightLength: kHour.nightLength,
    dayHourLength: kHour.dayHourLength,
    nightHourLength: kHour.nightHourLength,
    timestamp: date.getTime()
  };
}

function formatMillisecondsToTime(ms) {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function getKabbalisticHour(date, sunrise, sunset, humanLat, humanLon) {
  const dayLength = sunset - sunrise;
  const nextDayDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const nextDayTimes = SunCalc.getTimes(nextDayDate, humanLat, humanLon);
  const nightLength = nextDayTimes.sunrise - sunset;
  const dayHourLength = dayLength / 12;
  const nightHourLength = nightLength / 12;
  const dayHourLengthFormatted = formatMillisecondsToTime(dayHourLength);
  const nightHourLengthFormatted = formatMillisecondsToTime(nightHourLength);

  let hour;
  let hourLength;
  let period;

  if (date >= sunrise && date < sunset) {
    hour = Math.floor((date - sunrise) / dayHourLength) + 1;
    hourLength = dayHourLengthFormatted;
    period = "Day";
  } else {
    const nightStart = date < sunrise ? sunset : new Date(date.getTime() - (date - sunset));
    hour = Math.floor((date - nightStart) / nightHourLength) + 1;
    hourLength = nightHourLengthFormatted;
    period = "Night";
  }

  return {
    hour,
    hourLength,
    period,
    dayLength: formatMillisecondsToTime(dayLength),
    nightLength: formatMillisecondsToTime(nightLength),
    dayHourLength: dayHourLengthFormatted,
    nightHourLength: nightHourLengthFormatted
  };
}
