import type { Metadata } from "next";
import {
  LandingCategories,
  LandingFeatured,
} from "@/components/landing/discovery";
import {
  LandingFaq,
  LandingFinalCta,
  LandingTestimonials,
} from "@/components/landing/closing";
import { LandingHero } from "@/components/landing/hero";
import { LandingTrustStrip } from "@/components/landing/trust-strip";
import { LandingOrganizerCta } from "@/components/landing/organizer-cta";
import {
  LandingPillars,
  LandingStats,
  LandingSteps,
} from "@/components/landing/value";
import { siteConfig } from "@/config/site";
import { getFeaturedEvents } from "@/services/eventServices";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default async function HomePage() {
  const featured = await getFeaturedEvents(3);

  return (
    <main>
      <LandingTrustStrip />
      <LandingHero />
      <LandingStats />
      <LandingCategories />
      <LandingFeatured events={featured} />
      <LandingPillars />
      <LandingSteps />
      <LandingOrganizerCta />
      <LandingTestimonials />
      <LandingFaq />
      <LandingFinalCta />
    </main>
  );
}
