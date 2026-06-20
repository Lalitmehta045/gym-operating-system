'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-[var(--canvas)] h-[64px] px-[var(--spacing-md)] md:px-[var(--spacing-lg)] flex items-center justify-between text-[var(--on-primary)] transition-colors duration-300 border-b border-[var(--hairline-soft)] md:border-none">
        <div className="w-full flex items-center justify-between">
          {/* Left: Brand Dot + Wordmark */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="w-[12px] h-[12px] rounded-full bg-[var(--brand)] mr-2 shrink-0" />
            <span className="text-[20px] font-medium tracking-tight whitespace-nowrap">NexUp Fit</span>
          </Link>

          {/* Center: Links (Hidden on small screens) */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="#features" className="text-[var(--on-primary)] text-button-lg py-[var(--spacing-xs)] hover:opacity-80 transition-opacity">Features</Link>
            <Link href="#modules" className="text-[var(--on-primary)] text-button-lg py-[var(--spacing-xs)] hover:opacity-80 transition-opacity">Modules</Link>
            <Link href="#pricing" className="text-[var(--on-primary)] text-button-lg py-[var(--spacing-xs)] hover:opacity-80 transition-opacity">Pricing</Link>
            <Link href="#faq" className="text-[var(--on-primary)] text-button-lg py-[var(--spacing-xs)] hover:opacity-80 transition-opacity">FAQ</Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/login" className="!hidden md:!inline-flex text-[var(--ash)] text-button-sm font-medium hover:text-[var(--on-primary)] transition-colors">
              Sign In
            </Link>
            <Link href="/demo" className="!hidden lg:!inline-flex button-secondary-dark">
              Book a Demo
            </Link>
            <Link href="/register" className="button-primary !inline-flex !h-[36px] !px-4 !text-[14px] md:!h-[44px] md:!px-[var(--spacing-lg)] md:!text-[16px]">
              <span className="hidden sm:inline">Get Started Free</span>
              <span className="sm:hidden">Get Started</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-1 sm:p-2 text-[var(--on-primary)] ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--canvas)] pt-[80px] px-[var(--spacing-lg)] md:hidden flex flex-col"
          >
            <div className="flex flex-col gap-6 text-[24px]">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--on-primary)] font-medium">Features</Link>
              <Link href="#modules" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--on-primary)] font-medium">Modules</Link>
              <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--on-primary)] font-medium">Pricing</Link>
              <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--on-primary)] font-medium">FAQ</Link>
            </div>
            
            <div className="mt-auto mb-[var(--spacing-xl)] flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--on-primary)] text-center font-medium py-2">
                Sign In
              </Link>
              <Link href="/demo" onClick={() => setIsMobileMenuOpen(false)} className="button-secondary-dark !inline-flex w-full !h-[48px] !text-[16px]">
                Book a Demo
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="button-primary !inline-flex w-full !h-[48px]">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
