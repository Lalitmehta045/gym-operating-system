'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, User, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
  { title: "Member QR", desc: "Generated dynamically per member." },
  { title: "QR Scan at Reception", desc: "Instantly scanned at the front desk." },
  { title: "Member Verified", desc: "Real-time plan and status check." },
  { title: "Attendance Marked", desc: "Logged automatically in GymOS." }
];

export function QRAttendanceSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runSequence = (currentStep: number) => {
      let delay = 2000;
      if (currentStep === 0) delay = 2000;
      if (currentStep === 1) delay = 1500;
      if (currentStep === 2) delay = 2000;
      if (currentStep === 3) delay = 2500;

      timeout = setTimeout(() => {
        const next = (currentStep + 1) % 4;
        setStep(next);
        runSequence(next);
      }, delay);
    };

    runSequence(0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="bg-[var(--primary)] text-[var(--on-primary)] py-[var(--spacing-5xl)] px-[var(--spacing-lg)] relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1640px] relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center gap-[var(--spacing-section)]">
          
          {/* Left: Text Content & Steps */}
          <div className="lg:w-1/2 flex flex-col gap-[var(--spacing-xl)]">
            <div>
              <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-sm)] uppercase tracking-wider">
                Access Control
              </div>
              <h2 className="text-display-md mb-[var(--spacing-md)]">
                Lightning-Fast Check-ins
              </h2>
              <p className="text-body-lg text-[var(--ash)] max-w-xl">
                Eliminate queues at the front desk. Members use their unique dynamic QR codes for secure, contactless entry in under 1 second.
              </p>
            </div>

            <div className="flex flex-col gap-[var(--spacing-sm)] relative">
              
              {steps.map((s, i) => (
                <div 
                  key={i} 
                  className={`relative z-10 flex gap-[var(--spacing-md)] p-[var(--spacing-md)] rounded-[var(--radius-marketing)] border transition-all duration-500 ${
                    step === i 
                      ? 'bg-[var(--canvas-soft)] border-[var(--hairline-soft)]' 
                      : 'border-transparent opacity-50'
                  }`}
                >
                  {/* Vertical connecting line to the next step */}
                  {i !== steps.length - 1 && (
                    <div 
                      className="absolute left-[35px] top-[36px] w-[2px] bg-[var(--graphite)] z-[-1]"
                      style={{ height: 'calc(100% + var(--spacing-sm))' }}
                    />
                  )}

                  <div 
                    className={`w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center font-bold text-[14px] shrink-0 transition-colors duration-500 ${
                      step >= i ? 'bg-[var(--brand)] text-[var(--ink)]' : 'bg-[var(--canvas-soft)] text-[var(--mute)] border border-[var(--hairline-soft)]'
                    }`}
                  >
                    {step > i ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                  <div className="pt-2">
                    <h4 className={`text-body-md-strong transition-colors duration-500 ${step === i ? 'text-[var(--on-primary)]' : 'text-[var(--ash)]'}`}>
                      {s.title}
                    </h4>
                    <p className={`text-body-sm mt-1 transition-colors duration-500 ${step === i ? 'text-[var(--ash)]' : 'text-[var(--mute)]'}`}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Demo */}
          <div className="lg:w-1/2 w-full">
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[var(--radius-marketing)] bg-[var(--canvas-soft)] border border-[var(--hairline-soft)] overflow-hidden flex items-center justify-center">
              
              <AnimatePresence mode="wait">
                
                {/* Stage 1 & 2: QR Card */}
                {(step === 0 || step === 1) && (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="w-80 h-[360px] flex flex-col justify-center items-center bg-[var(--canvas-light)] rounded-[var(--radius-marketing)] overflow-hidden relative z-10 border border-[var(--hairline)]"
                  >
                    <div className="p-[var(--spacing-xl)] flex flex-col items-center w-full">
                      <div className="text-[var(--ink)] font-bold text-lg mb-6">Member ID</div>
                      <div className="relative w-48 h-48 bg-[var(--canvas-paper)] rounded-[var(--radius-app-md)] flex items-center justify-center p-3 border border-[var(--hairline)]">
                        <QrCode className="w-full h-full text-[var(--ink)]" strokeWidth={1.5} />
                        
                        {/* Scanning Line Animation */}
                        {step === 1 && (
                          <motion.div 
                            initial={{ top: '0%' }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                            className="absolute left-0 w-full h-[4px] bg-[var(--brand)] z-10"
                          />
                        )}
                        {/* Corner brackets */}
                        {step === 1 && (
                          <div className="absolute inset-0 border-2 border-[var(--brand)] opacity-40 rounded-[var(--radius-app-md)]" />
                        )}
                      </div>
                      <div className="mt-6 text-meta text-[var(--mute)] font-mono tracking-wider">ID: 8472-9102</div>
                    </div>
                  </motion.div>
                )}

                {/* Stage 3: Verification Card */}
                {step === 2 && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="w-80 h-[360px] flex flex-col justify-center bg-[var(--canvas-light)] rounded-[var(--radius-marketing)] border border-[var(--hairline)] overflow-hidden p-[var(--spacing-xl)] relative z-10"
                  >
                    <div className="flex items-center gap-[var(--spacing-md)] mb-[var(--spacing-lg)]">
                      <div className="w-16 h-16 rounded-[var(--radius-full)] bg-[var(--canvas-paper)] flex items-center justify-center border border-[var(--hairline)] shrink-0">
                        <User className="w-8 h-8 text-[var(--mute)]" />
                      </div>
                      <div>
                        <div className="text-body-md-strong text-[var(--ink)]">Alex Carter</div>
                        <div className="text-meta text-[var(--mute)] font-mono mt-1">ID: 8472-9102</div>
                      </div>
                    </div>
                    
                    <div className="space-y-[var(--spacing-xs)]">
                      <div className="flex justify-between items-center py-[var(--spacing-sm)] border-b border-[var(--hairline)]">
                        <span className="text-body-sm text-[var(--mute)]">Membership</span>
                        <span className="text-body-sm font-bold text-[var(--ink)]">Pro Annual</span>
                      </div>
                      <div className="flex justify-between items-center py-[var(--spacing-sm)] border-b border-[var(--hairline)]">
                        <span className="text-body-sm text-[var(--mute)]">Status</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-app-sm)] bg-[#e6f4ea] text-[var(--success)] text-xs font-bold border border-[#ceead6]">
                          <span className="w-1.5 h-1.5 rounded-[var(--radius-full)] bg-[var(--success)] animate-pulse"></span>
                          Active
                        </span>
                      </div>
                    </div>
                    
                    {/* Fake Loading Bar effect */}
                    <div className="mt-[var(--spacing-lg)] w-full h-[4px] bg-[var(--canvas-paper)] rounded-[var(--radius-full)] overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        className="h-full bg-[var(--brand)]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Stage 4: Success State */}
                {step === 3 && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="w-80 h-[360px] flex flex-col justify-center items-center bg-[var(--success)] rounded-[var(--radius-marketing)] overflow-hidden p-[var(--spacing-xl)] text-center text-white relative z-10"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                      className="mx-auto w-20 h-20 bg-white rounded-[var(--radius-full)] flex items-center justify-center mb-[var(--spacing-md)] shadow-lg"
                    >
                      <Check className="w-10 h-10 text-[var(--success)]" strokeWidth={3} />
                    </motion.div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-body-md-strong mb-[var(--spacing-xs)] text-[#ffffff]"
                    >
                      Attendance Recorded
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-body-sm font-medium text-[#ffffff] opacity-90"
                    >
                      Alex Carter • 08:24 AM
                    </motion.p>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
