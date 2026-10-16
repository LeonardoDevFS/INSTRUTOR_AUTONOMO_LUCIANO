type BookingEnvironment = Record<string, string | undefined>;

const googleBookingHosts = new Set([
  "calendar.app.google",
  "calendar.google.com",
]);

const googleSchedulePath =
  /^\/calendar(?:\/u\/\d+)?\/appointments\/schedules\//;

export type GoogleBookingConfig =
  | { status: "missing" }
  | { status: "invalid" }
  | {
      status: "ready";
      url: string;
      canEmbed: boolean;
    };

export function getGoogleBookingConfig(
  environment: BookingEnvironment = process.env,
): GoogleBookingConfig {
  const configuredUrl = environment.NEXT_PUBLIC_GOOGLE_BOOKING_URL?.trim();

  if (!configuredUrl) return { status: "missing" };

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

    const isSchedule =
      hostname === "calendar.google.com" &&
      googleSchedulePath.test(url.pathname);
    const isShortLink =
      hostname === "calendar.app.google" && url.pathname.length > 1;

    if (!isSchedule && !isShortLink) return { status: "invalid" };

    url.hash = "";
    return {
      status: "ready",
      url: url.toString(),
      canEmbed: isSchedule,
    };
  } catch {
    return { status: "invalid" };
  }
}
