import Link from 'next/link';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '/signup',
    priceMonthly: '₹999',
    description: 'Perfect for small studios just getting started with digitalization.',
    features: ['Up to 100 members', 'Basic attendance tracking', 'Manual billing', 'Email support'],
    featured: false,
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    href: '/signup',
    priceMonthly: '₹2,499',
    description: 'Everything you need to scale your growing fitness business.',
    features: ['Up to 500 members', 'QR Code attendance', 'Automated payments', 'WhatsApp automation', 'Priority support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '/book-demo',
    priceMonthly: 'Custom',
    description: 'Advanced features for multi-location gyms and franchises.',
    features: ['Unlimited members', 'Multi-tenant architecture', 'Custom API access', 'Dedicated account manager', 'White-label options'],
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="marketing-section-light px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mx-auto max-w-4xl text-center mb-[var(--spacing-section)]">
          <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-md)]">
            Simple Pricing
          </div>
          <h2 className="text-display-md mb-[var(--spacing-md)] text-[var(--ink)]">
            Pricing that scales with you
          </h2>
          <p className="text-subtitle text-[var(--ink-soft)] max-w-2xl mx-auto">
            No hidden fees. No surprise charges. Choose the plan that fits your gym's current size.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-lg)]">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={tier.featured ? 'pricing-card-featured' : 'pricing-card'}
            >
              <div className="flex flex-col h-full">
                <h3 className="text-heading-md mb-[var(--spacing-sm)]">
                  {tier.name}
                </h3>
                <p className={`text-body mb-[var(--spacing-lg)] ${tier.featured ? 'text-[var(--ash)]' : 'text-[var(--ink-soft)]'}`}>
                  {tier.description}
                </p>
                <div className="mb-[var(--spacing-lg)] flex items-baseline gap-x-1">
                  <span className="text-display-md">{tier.priceMonthly}</span>
                  {tier.priceMonthly !== 'Custom' && (
                    <span className="text-body-sm text-[var(--mute)]">/month</span>
                  )}
                </div>

                <Link
                  href={tier.href}
                  className={tier.featured ? 'button-primary w-full' : 'button-primary-on-light w-full'}
                >
                  {tier.name === 'Enterprise' ? 'Book Demo' : 'Start Free Trial'}
                </Link>

                <ul role="list" className="mt-[var(--spacing-xl)] space-y-[var(--spacing-sm)] text-body-sm flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 items-start">
                      <Check className="h-5 w-5 flex-none text-[var(--success)]" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
