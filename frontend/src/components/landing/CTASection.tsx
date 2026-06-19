import Link from 'next/link';

export function CTASection() {
  return (
    <section className="marketing-section-dark px-[var(--spacing-lg)] relative overflow-hidden text-center border-t border-[var(--hairline-soft)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-[var(--brand)] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto w-full max-w-[1640px] relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-display-md text-[var(--on-primary)] mb-[var(--spacing-md)]">
            Ready to Transform Your Gym?
          </h2>
          <p className="text-subtitle text-[var(--ash)] mb-[var(--spacing-xl)]">
            Join 500+ other fitness businesses that have upgraded their operating system. Stop managing, start growing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-[var(--spacing-md)]">
            <Link href="/signup" className="button-primary w-full sm:w-auto">
              Start Free Trial
            </Link>
            <Link href="/book-demo" className="button-ghost-dark w-full sm:w-auto">
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
