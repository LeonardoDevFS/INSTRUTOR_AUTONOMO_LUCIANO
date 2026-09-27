import type { Metadata } from "next";

import { AuthoritySection } from "@/components/home/AuthoritySection";
import { BookingTeaser } from "@/components/home/BookingTeaser";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { GoalsSection } from "@/components/home/GoalsSection";
import { GuidesSection } from "@/components/home/GuidesSection";
import { Hero } from "@/components/home/Hero";
import { LicensedDriversSection } from "@/components/home/LicensedDriversSection";
import { MentorshipSection } from "@/components/home/MentorshipSection";
import { ResultsTeaser } from "@/components/home/ResultsTeaser";
import { VehicleTrainingSection } from "@/components/home/VehicleTrainingSection";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.seo.defaultTitle,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <GoalsSection />
      <AuthoritySection />
      <MentorshipSection />
      <VehicleTrainingSection />
      <LicensedDriversSection />
      <ResultsTeaser />
      <BookingTeaser />
      <GuidesSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
