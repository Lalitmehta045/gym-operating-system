'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-[var(--canvas)] text-[var(--on-primary)] pt-[var(--spacing-section-lg)] pb-[var(--spacing-section-lg)] px-[var(--spacing-lg)]">
      <div className="w-full mx-auto flex flex-col items-center text-center">
        
        {/* Mono Eyebrow */}
        <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-md)]">
          Gym OS Version 1.0
        </div>
        
        {/* Main Heading */}
        <h1 className="text-display-mega mb-[var(--spacing-lg)] max-w-5xl">
          Structure powers intelligence
        </h1>

        {/* Subtitle */}
        <p className="text-subtitle text-[var(--ash)] mb-[var(--spacing-lg)] max-w-3xl">
          Manage members, attendance, subscriptions, payments, invoices, QR check-ins, and WhatsApp automation—all from one highly optimized platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-[var(--spacing-sm)] mb-[var(--spacing-section)]">
          <Link href="/register" className="button-primary">
            Get Started Free
          </Link>
        </div>

        {/* Studio Window Screenshot */}
        <div className="w-full max-w-[1200px] mt-[var(--spacing-xl)]">
          <div className="studio-window">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 mb-[var(--spacing-sm)]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            
            <Image
              src="/nexup-fit-hero.png"
              alt="NexUp Fit Dashboard"
              width={2400}
              height={1600}
              className="rounded-[var(--radius-app-sm)] w-full h-auto border border-[var(--hairline-soft)]"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}
