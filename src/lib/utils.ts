import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHour(time: string) {
  const [hours, minutes] = time.split(":");

  return minutes === "00" ? `${hours}h` : `${hours}h${minutes}`;
}

export function formatScheduleRange(opening: string, closing: string) {
  return `${formatHour(opening)} às ${formatHour(closing)}`;
}
