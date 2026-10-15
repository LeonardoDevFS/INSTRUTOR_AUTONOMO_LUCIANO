import type { Metadata } from "next";

import { CancelBooking } from "@/components/booking/CancelBooking";

export const metadata: Metadata = {
  title: "Cancelar agendamento",
  description: "Acesso seguro para cancelar uma reserva feita pelo site Direção Segura.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function CancelBookingPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-24 sm:py-28 lg:px-8">
      <CancelBooking />
    </main>
  );
}
