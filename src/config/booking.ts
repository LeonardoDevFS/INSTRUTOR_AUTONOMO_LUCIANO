const googleBookingHosts = new Set([
  "calendar.app.google",
  "calendar.google.com",
]);

const googleSchedulePath = /^\/calendar(?:\/u\/\d+)?\/appointments\/schedules\//;

export type GoogleBookingConfig =
  | { status: "missing" }
  | { status: "invalid" }
  | {
      status: "ready";
      url: string;
      canEmbed: boolean;
    };

export function getGoogleBookingConfig(): GoogleBookingConfig {
  const configuredUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL?.trim();

  if (!configuredUrl) {
    return { status: "missing" };
  }

  try {
    const url = new URL(configuredUrl);
    const hostname = url.hostname.toLowerCase();

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !googleBookingHosts.has(hostname)
    ) {
      return { status: "invalid" };
    }

    const isGoogleCalendarSchedule =
      hostname === "calendar.google.com" && googleSchedulePath.test(url.pathname);
    const isGoogleBookingLink =
      hostname === "calendar.app.google" && url.pathname.length > 1;

    if (!isGoogleCalendarSchedule && !isGoogleBookingLink) {
      return { status: "invalid" };
    }

    url.hash = "";

    return {
      status: "ready",
      url: url.toString(),
      canEmbed: isGoogleCalendarSchedule,
    };
  } catch {
    return { status: "invalid" };
  }
}
