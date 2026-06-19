'use client';

import { motion } from 'framer-motion';

export function AnalyticsSection() {
  return (
    <section className="marketing-section-light px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mx-auto max-w-2xl text-center mb-[var(--spacing-section)]">
          <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-sm)] uppercase tracking-wider">Analytics</div>
          <h2 className="text-display-md text-[var(--ink)] mb-[var(--spacing-md)]">
            Insights that drive growth
          </h2>
          <p className="text-subtitle text-[var(--ink-soft)]">
            Stop guessing. Our enterprise-grade analytics give you absolute clarity on your revenue, retention, and peak attendance hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-lg)]">
          
          {/* Revenue Growth Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="feature-card-light flex flex-col"
          >
            <h3 className="text-heading-sm text-[var(--ink)] mb-1">Revenue Growth</h3>
            <p className="text-body-sm text-[var(--ink-soft)] mb-[var(--spacing-lg)]">+24% from last month</p>
            
            <div className="mt-auto h-32 flex items-end gap-2">
              {[40, 55, 45, 70, 65, 85, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-[var(--brand)] rounded-t-[var(--radius-app-xs)]" style={{ height: `${height}%` }}></div>
              ))}
            </div>
          </motion.div>

          {/* Attendance Trends Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="feature-card-light flex flex-col"
          >
            <h3 className="text-heading-sm text-[var(--ink)] mb-1">Peak Attendance</h3>
            <p className="text-body-sm text-[var(--ink-soft)] mb-[var(--spacing-lg)]">Highest traffic at 6:00 PM</p>
            
            <div className="mt-auto h-32 relative">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 L0,50 Q25,20 50,60 T100,20 L100,100 Z" fill="rgba(20, 184, 166, 0.2)" />
                <path d="M0,50 Q25,20 50,60 T100,20" fill="none" stroke="#14B8A6" strokeWidth="3" />
              </svg>
            </div>
          </motion.div>

          {/* Member Growth Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="feature-card-light flex flex-col"
          >
            <h3 className="text-heading-sm text-[var(--ink)] mb-1">Active Members</h3>
            <p className="text-body-sm text-[var(--ink-soft)] mb-[var(--spacing-lg)]">92% retention rate</p>
            
            <div className="mt-auto h-32 relative flex items-center justify-center">
              {/* Abstract donut chart */}
              <div className="w-24 h-24 rounded-[var(--radius-full)] border-[8px] border-[var(--canvas-paper)] relative shadow-inner">
                <div className="absolute inset-[-8px] rounded-[var(--radius-full)] border-[8px] border-[var(--ink)] border-t-transparent border-r-transparent transform -rotate-45"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
