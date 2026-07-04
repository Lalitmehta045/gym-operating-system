import { Users, CalendarCheck, QrCode, CreditCard, Receipt, MessageCircle, LineChart, Layers } from 'lucide-react';

const features = [
  {
    name: 'Member Management',
    description: 'Centralized database for all members, detailed profiles, and activity logs.',
    icon: Users,
    label: 'Core',
  },
  {
    name: 'Attendance Tracking',
    description: 'Real-time logs of entry and exit times with historical data and reporting.',
    icon: CalendarCheck,
    label: 'Core',
  },
  {
    name: 'QR Check-ins',
    description: 'Lightning-fast secure entry using dynamic QR codes for each member.',
    icon: QrCode,
    label: 'Access',
  },
  {
    name: 'Subscription Management',
    description: 'Automated renewals, expiry tracking, and flexible membership plans.',
    icon: CreditCard,
    label: 'Billing',
  },
  {
    name: 'Payments & Invoices',
    description: 'Streamlined billing, integrated payment gateways, and automated invoicing.',
    icon: Receipt,
    label: 'Billing',
  },
  {
    name: 'WhatsApp Automation',
    description: 'Trigger instant alerts for renewals, pending payments, and check-ins.',
    icon: MessageCircle,
    label: 'Marketing',
  },
  {
    name: 'Analytics Dashboard',
    description: 'Deep insights into revenue growth, member retention, and daily attendance.',
    icon: LineChart,
    label: 'Insights',
  },
  {
    name: 'Multi-Tenant SaaS',
    description: 'Enterprise-grade architecture isolating your data for maximum security.',
    icon: Layers,
    label: 'Platform',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="marketing-section-dark px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mx-auto max-w-4xl text-center mb-[var(--spacing-section)]">
          <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-md)]">
            Everything You Need
          </div>
          <h2 className="text-display-md mb-[var(--spacing-md)]">
            A complete operating system for your gym.
          </h2>
          <p className="text-subtitle text-[var(--ash)] max-w-3xl mx-auto">
            NexUp Fit replaces 5 different tools with one seamless, premium platform. We focus on automation so you can focus on growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-lg)]">
          {features.map((feature) => (
            <div key={feature.name} className="feature-card-dark flex flex-col h-full hover:border-[var(--mute)] transition-colors duration-300">
              <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-sm)] uppercase tracking-wider">
                {feature.label}
              </div>
              <h3 className="text-heading-sm mb-[var(--spacing-sm)] flex items-center gap-2">
                <feature.icon className="w-6 h-6 text-[var(--brand)]" strokeWidth={1.5} />
                {feature.name}
              </h3>
              <p className="text-body text-[var(--ash)] flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
