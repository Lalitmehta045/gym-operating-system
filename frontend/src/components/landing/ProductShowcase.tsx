'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

const highlights = [
  'Real-time actionable insights',
  'One-click WhatsApp reminders',
  'Automated invoice generation',
  'Role-based access control',
  'Mobile-optimized for staff',
  '100% cloud-based architecture'
];

export function ProductShowcase() {
  return (
    <section className="marketing-section-light px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="flex flex-col items-center text-center mb-[var(--spacing-section-lg)]">
          <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-md)]">
            Absolute Control
          </div>
          <h2 className="text-display-md text-[var(--ink)] max-w-3xl mb-[var(--spacing-md)]">
            Engineered for absolute control.
          </h2>
          <p className="text-subtitle text-[var(--ink-soft)] max-w-3xl">
            Stop juggling multiple spreadsheets and software. NexUp Fit gives you a bird's-eye view of your entire operation, wrapped in a beautiful, lightning-fast interface.
          </p>
        </div>

        <div className="relative mx-auto max-w-[1200px]">
          <div className="studio-window">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 mb-[var(--spacing-sm)]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <Image
              src="/nexup-fit-hero.png"
              alt="NexUp Fit Dashboard UI"
              width={2400}
              height={1600}
              className="rounded-[var(--radius-app-sm)] w-full h-auto border border-[var(--hairline-soft)]"
            />
          </div>
        </div>
        
        <div className="mt-[var(--spacing-section)] mx-auto max-w-4xl">
          <dl className="grid grid-cols-1 gap-[var(--spacing-md)] md:grid-cols-2 lg:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex gap-[var(--spacing-xs)] items-center">
                <CheckCircle2 className="h-5 w-5 flex-none text-[var(--brand)]" aria-hidden="true" />
                <span className="text-body-sm text-[var(--ink)]">{highlight}</span>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </section>
  );
}
