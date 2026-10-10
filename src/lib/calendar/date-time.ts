import { DEFAULT_TIME_ZONE } from "@/lib/calendar/constants";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return parts as DateParts;
}

function getTimeZoneOffset(date: Date, timeZone: string) {
  const parts = getParts(date, timeZone);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return representedAsUtc - date.getTime();
}

export function zonedLocalToUtc(
  date: string,
  time: string,
  timeZone = DEFAULT_TIME_ZONE,
) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let result = localAsUtc - getTimeZoneOffset(new Date(localAsUtc), timeZone);
  result = localAsUtc - getTimeZoneOffset(new Date(result), timeZone);
  return new Date(result);
}

export function addDays(date: string, amount: number) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function toGoogleEventRange(
  input: {
    date: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
  },
  timeZone = DEFAULT_TIME_ZONE,
) {
  if (input.allDay) {
    return {
      start: { date: input.date },
      end: { date: addDays(input.date, 1) },
      rangeStart: zonedLocalToUtc(input.date, "00:00", timeZone),
      rangeEnd: zonedLocalToUtc(addDays(input.date, 1), "00:00", timeZone),
    };
  }

  return {
    start: { dateTime: `${input.date}T${input.startTime}:00`, timeZone },
    end: { dateTime: `${input.date}T${input.endTime}:00`, timeZone },
    rangeStart: zonedLocalToUtc(input.date, input.startTime, timeZone),
    rangeEnd: zonedLocalToUtc(input.date, input.endTime, timeZone),
  };
}
