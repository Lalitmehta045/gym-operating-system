export function TrustSection() {
  const stats = [
    { id: 1, name: 'Gyms', value: '500+' },
    { id: 2, name: 'Members', value: '50K+' },
    { id: 3, name: 'Processed', value: '₹10Cr+' },
    { id: 4, name: 'Uptime', value: '99.9%' },
  ];

  return (
    <section className="marketing-section-paper px-[var(--spacing-lg)] border-y border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="text-center mb-[var(--spacing-xl)]">
          <h2 className="text-mono-caps text-[var(--mute)]">
            Trusted by the fastest-growing fitness businesses
          </h2>
        </div>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)]">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center justify-center text-center">
              <dt className="text-body text-[var(--ink-soft)] mb-[var(--spacing-xs)]">{stat.name}</dt>
              <dd className="text-display-md text-[var(--ink)]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
