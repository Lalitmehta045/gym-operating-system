import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { ModulesSection } from '@/components/landing/ModulesSection';
import { QRAttendanceSection } from '@/components/landing/QRAttendanceSection';
import { WhatsAppAutomation } from '@/components/landing/WhatsAppAutomation';
import { AnalyticsSection } from '@/components/landing/AnalyticsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'NexUp Fit — Gym Management Software',
  description: 'Manage members, attendance, subscriptions, payments, invoices and WhatsApp automation with NexUp Fit.',
  openGraph: {
    title: 'NexUp Fit — Gym Management Software',
    description: 'Manage members, attendance, subscriptions, payments, invoices and WhatsApp automation with NexUp Fit.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexUp Fit — Gym Management Software',
    description: 'Manage members, attendance, subscriptions, payments, invoices and WhatsApp automation with NexUp Fit.',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-[var(--canvas)] selection:bg-[var(--surface-blue)] selection:text-[var(--ink)]">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <ProductShowcase />
        <ModulesSection />
        <QRAttendanceSection />
        <WhatsAppAutomation />
        <AnalyticsSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
