import { CtaSection } from '@/components/marketing/cta-section';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { HeroSection } from '@/components/marketing/hero-section';
import { PricingPreview } from '@/components/marketing/pricing-preview';
import { ScreenshotsShowcase } from '@/components/marketing/screenshots-showcase';
import { Testimonials } from '@/components/marketing/testimonials';
import { TrustStats } from '@/components/marketing/trust-stats';
import { WorkflowTimeline } from '@/components/marketing/workflow-timeline';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStats />
      <ScreenshotsShowcase />
      <WorkflowTimeline />
      <FeaturesGrid />
      <Testimonials />
      <PricingPreview />
      <CtaSection />
    </>
  );
}
