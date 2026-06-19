import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[var(--canvas)] text-[var(--on-primary)] py-[var(--spacing-section)] px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        
        {/* 6-Column Grid (or 4 for simplicity if not enough links, but design specifies 6) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-[var(--spacing-section)]">
          {/* Column 1 */}
          <div>
            <h3 className="text-mono-caps text-[var(--mute)] mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Features</Link></li>
              <li><Link href="#modules" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Modules</Link></li>
              <li><Link href="#pricing" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Pricing</Link></li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h3 className="text-mono-caps text-[var(--mute)] mb-4">Solutions</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">For Studios</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">For Chains</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">For Trainers</Link></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h3 className="text-mono-caps text-[var(--mute)] mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Webinars</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Help Center</Link></li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
            <h3 className="text-mono-caps text-[var(--mute)] mb-4">Customers</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Case Studies</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          {/* Column 5 */}
          <div>
            <h3 className="text-mono-caps text-[var(--mute)] mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">About</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Contact</Link></li>
            </ul>
          </div>
          {/* Column 6 */}
          <div>
            <h3 className="text-mono-caps text-[var(--mute)] mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-caption text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between pt-8 border-t border-[var(--graphite)]">
          <p className="text-meta text-[var(--mute)] mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} NexUp Technologies. All rights reserved.
          </p>
          
          <div className="flex items-center">
            <div className="w-[12px] h-[12px] rounded-full bg-[var(--brand)] mr-2" />
            <span className="text-[20px] font-medium tracking-tight">NexUp Fit</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
