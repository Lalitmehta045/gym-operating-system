import Link from 'next/link';
import { Check, X, Minus } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '/signup',
    priceMonthly: '₹1,499',
    priceSubtext: '/month',
    description: 'Perfect for small studios just getting started with digitalization.',
    features: [
      { name: 'Payment Gateway', status: 'missing', text: 'Not included' },
      { name: 'WhatsApp Integration', status: 'missing', text: 'Not included' },
      { name: 'Website', status: 'none', text: '-' },
      { name: 'GMB Profile', status: 'none', text: '-' }
    ],
    featured: false,
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    href: '/signup',
    priceMonthly: '₹1,999',
    priceSubtext: '/month',
    description: 'Everything you need to scale your growing fitness business.',
    features: [
      { name: 'Payment Gateway', status: 'included', text: 'Included' },
      { name: 'WhatsApp Integration', status: 'included', text: 'Included' },
      { name: 'Website', status: 'none', text: '-' },
      { name: 'GMB Profile', status: 'none', text: '-' }
    ],
    featured: true,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/book-demo',
    priceMonthly: '₹7,999',
    priceSubtext: 'one-time (Month 1) → ₹1,999/month (Month 2 onwards)',
    description: 'Advanced features including website creation and GMB setup.',
    features: [
      { name: 'Payment Gateway', status: 'included', text: 'Included (Growth features)' },
      { name: 'WhatsApp Integration', status: 'included', text: 'Included (Growth features)' },
      { name: 'Website', status: 'included', text: 'Created' },
      { name: 'GMB Profile', status: 'included', text: 'Created' }
    ],
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
            Choose the plan that fits your gym's current size and needs.
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
                <p className={`text-body mb-[var(--spacing-lg)] ${tier.featured ? 'opacity-80' : 'text-[var(--ink-soft)]'}`}>
                  {tier.description}
                </p>
                <div className="mb-[var(--spacing-lg)] flex flex-col gap-1">
                  <div className="flex items-baseline gap-x-1">
                    <span className="text-display-md">{tier.priceMonthly}</span>
                    {tier.priceSubtext === '/month' && (
                      <span className={`text-body-sm ${tier.featured ? 'opacity-60' : 'text-[var(--mute)]'}`}>/month</span>
                    )}
                  </div>
                  {tier.priceSubtext !== '/month' && (
                    <span className={`text-body-sm leading-tight ${tier.featured ? 'opacity-80' : 'text-[var(--mute)]'}`}>
                      {tier.priceSubtext}
                    </span>
                  )}
                </div>

                <Link
                  href={tier.href}
                  className={tier.featured ? 'button-primary w-full' : 'button-primary-on-light w-full'}
                >
                  {tier.name === 'Pro' ? 'Book Demo' : 'Start Free Trial'}
                </Link>

                <ul role="list" className="mt-[var(--spacing-xl)] space-y-[var(--spacing-md)] text-body-sm flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex gap-x-3 items-start">
                      {feature.status === 'included' ? (
                        <Check className="h-5 w-5 flex-none text-[var(--success)]" aria-hidden="true" />
                      ) : feature.status === 'missing' ? (
                        <X className="h-5 w-5 flex-none text-red-500" aria-hidden="true" />
                      ) : (
                        <Minus className="h-5 w-5 flex-none text-[var(--mute)]" aria-hidden="true" />
                      )}
                      <span className="text-current">
                        <span className="font-semibold">{feature.name}:</span>{' '}
                        <span className="opacity-80">{feature.text}</span>
                      </span>
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
