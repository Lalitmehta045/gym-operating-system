'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Clock, MessageCircle, CreditCard, RefreshCw, CheckCircle2, TrendingUp, Smartphone, ArrowRight } from 'lucide-react';

function Counter({ from, to }: { from: number, to: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(from, to, {
        duration: 1,
        onUpdate(value) {
          node.textContent = Math.round(value).toLocaleString() + ".00";
        }
      });
      return () => controls.stop();
    }
  }, [from, to]);

  return <span ref={nodeRef} />;
}

export function WhatsAppAutomation() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    { id: 0, title: 'Expiring', icon: Clock },
    { id: 1, title: 'Reminder', icon: MessageCircle },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Success', icon: CheckCircle2 },
    { id: 4, title: 'Renewed', icon: RefreshCw },
    { id: 5, title: 'Revenue', icon: TrendingUp },
  ];

  return (
    <section className="marketing-section-dark px-[var(--spacing-lg)] overflow-hidden">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mx-auto max-w-2xl text-center mb-[var(--spacing-section)]">
          <div className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-sm)] uppercase tracking-wider">Automation</div>
          <h2 className="text-display-md text-[var(--on-primary)] mb-[var(--spacing-md)]">
            Zero-Touch Renewals
          </h2>
          <p className="text-subtitle text-[var(--ash)]">
            Let the system handle the awkward payment conversations. Integrated WhatsApp automation ensures you get paid on time, every time.
          </p>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-[var(--spacing-section)] items-center">
          
          {/* Progress Timeline */}
          <div className="w-full lg:w-1/3 flex flex-col gap-[var(--spacing-lg)] relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-[var(--graphite)] z-0" />
            <motion.div 
              className="absolute left-[19px] top-6 w-[2px] bg-[var(--brand)] z-0 origin-top"
              initial={{ height: '0%' }}
              animate={{ height: `${(stage / 5) * 100}%` }}
              transition={{ ease: "linear", duration: 0.5 }}
            />
            {stages.map((s, i) => {
              const isActive = stage >= i;
              return (
                <div key={s.id} className="flex items-center gap-[var(--spacing-md)] relative z-10">
                  <div className={`w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center border transition-colors duration-500 ${isActive ? 'bg-[var(--brand)] border-[var(--brand)] text-[var(--ink)] shadow-md' : 'bg-[var(--canvas-soft)] border-[var(--hairline-soft)] text-[var(--mute)]'}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className={`text-body-sm font-semibold transition-colors duration-500 ${isActive ? 'text-[var(--on-primary)]' : 'text-[var(--ash)]'}`}>
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Demo Area */}
          <div className="w-full lg:w-2/3 h-[420px] bg-[var(--canvas-soft)] border border-[var(--hairline-soft)] rounded-[var(--radius-marketing)] shadow-xl relative flex items-center justify-center p-[var(--spacing-lg)]">
            
            <div className="relative z-10 w-full flex justify-center">
              <AnimatePresence mode="wait">
                {stage === 0 && (
                  <motion.div
                    key="stage-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-[var(--radius-marketing)] p-[var(--spacing-lg)] w-full max-w-sm shadow-lg flex flex-col items-center justify-center h-[340px]"
                  >
                    <div className="w-20 h-20 rounded-[var(--radius-full)] bg-[var(--canvas-paper)] mb-[var(--spacing-md)] flex items-center justify-center text-[var(--mute)] font-bold text-2xl border-4 border-white shadow-sm">
                      SJ
                    </div>
                    <h3 className="text-heading-sm text-[var(--ink)] mb-1">Sarah Jenkins</h3>
                    <div className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-[var(--radius-full)] text-caption-tight font-bold mb-[var(--spacing-lg)]">
                      Expiring in 2 days
                    </div>
                    <div className="w-full border-t border-[var(--hairline)] pt-[var(--spacing-md)] flex justify-between text-body-sm text-[var(--ink-soft)] mt-auto">
                      <span>Pro Annual Plan</span>
                      <span className="font-semibold text-[var(--ink)]">$299.00</span>
                    </div>
                  </motion.div>
                )}

                {(stage >= 1 && stage <= 3) && (
                  <motion.div
                    key="stage-1-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm bg-[#efeae2] border border-[var(--hairline)] rounded-[var(--radius-marketing)] shadow-xl overflow-hidden flex flex-col h-[340px]"
                  >
                    {/* WhatsApp Header */}
                    <div className="bg-[#075e54] px-4 py-3 flex items-center gap-[var(--spacing-sm)]">
                      <div className="w-8 h-8 rounded-[var(--radius-full)] bg-white/20 flex items-center justify-center text-white">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="text-white">
                        <div className="text-body-sm font-bold">NexUp Fit Bot</div>
                        <div className="text-meta text-white/70">Online</div>
                      </div>
                    </div>
                    {/* Chat Area */}
                    <div className="flex-1 p-[var(--spacing-md)] flex flex-col gap-[var(--spacing-xs)] overflow-hidden relative">
                      <div className="absolute inset-0 opacity-[0.03] bg-black z-0"></div>
                      
                      <div className="relative z-10 flex flex-col gap-[var(--spacing-sm)]">
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9, transformOrigin: 'top left' }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="bg-white rounded-[var(--radius-app-lg)] rounded-tl-none p-[var(--spacing-sm)] text-caption text-[var(--ink)] shadow-sm self-start max-w-[85%]"
                        >
                          Hi Sarah! 👋 Your Pro Annual plan at <strong>NexUp Fit</strong> expires in 2 days. 
                        </motion.div>
                        
                        {stage >= 2 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9, transformOrigin: 'top left' }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="bg-white rounded-[var(--radius-app-lg)] rounded-tl-none p-[var(--spacing-sm)] text-caption text-[var(--ink)] shadow-sm self-start max-w-[85%] flex flex-col gap-[var(--spacing-xs)]"
                          >
                            <div>Tap below to renew instantly. No login required!</div>
                            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-[var(--radius-app-sm)] p-[var(--spacing-xs)] text-center text-[#075e54] font-semibold flex items-center justify-center gap-1 cursor-pointer hover:bg-[#25D366]/20 transition-colors">
                              Pay $299.00 <ArrowRight className="w-3 h-3" />
                            </div>
                          </motion.div>
                        )}

                        {stage >= 3 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9, transformOrigin: 'top right' }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="bg-[#dcf8c6] rounded-[var(--radius-app-lg)] rounded-tr-none p-[var(--spacing-sm)] text-caption text-[var(--ink)] shadow-sm self-end max-w-[85%] flex items-center gap-[var(--spacing-xs)]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Payment Successful!
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {stage === 4 && (
                  <motion.div
                    key="stage-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-[var(--radius-marketing)] p-[var(--spacing-lg)] w-full max-w-sm shadow-lg flex flex-col items-center justify-center relative overflow-hidden h-[340px]"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--success)]" />
                    <div className="w-20 h-20 rounded-[var(--radius-full)] bg-[#e6f4ea] mb-[var(--spacing-md)] flex items-center justify-center text-[var(--success)] border-4 border-[var(--canvas-light)] shadow-sm ring-1 ring-[#ceead6]">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-heading-sm text-[var(--ink)] mb-1">Sarah Jenkins</h3>
                    <div className="px-3 py-1 bg-[#e6f4ea] border border-[#ceead6] text-[var(--success)] rounded-[var(--radius-full)] text-caption-tight font-bold mb-[var(--spacing-lg)]">
                      Active
                    </div>
                    <div className="w-full border-t border-[var(--hairline)] pt-[var(--spacing-md)] flex justify-between text-body-sm text-[var(--ink-soft)] mt-auto">
                      <span>Valid until</span>
                      <span className="font-semibold text-[var(--ink)]">Next Year</span>
                    </div>
                  </motion.div>
                )}

                {stage === 5 && (
                  <motion.div
                    key="stage-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-[var(--radius-marketing)] p-[var(--spacing-lg)] shadow-xl flex flex-col justify-center h-[340px]"
                  >
                    <div className="flex justify-between items-center mb-[var(--spacing-lg)]">
                      <div className="text-body-sm font-semibold text-[var(--ink-soft)]">Revenue Today</div>
                      <div className="p-2 bg-[#e6f4ea] rounded-[var(--radius-app-lg)]">
                        <TrendingUp className="w-5 h-5 text-[var(--success)]" />
                      </div>
                    </div>
                    <div className="text-display-md text-[var(--ink)] flex items-baseline gap-1 mb-[var(--spacing-sm)]">
                      <span>$</span>
                      <Counter from={1200} to={1499} />
                    </div>
                    <div className="text-caption-tight text-[var(--success)] font-bold bg-[#e6f4ea] border border-[#ceead6] self-start px-2 py-1 rounded-[var(--radius-full)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-[var(--radius-full)] bg-[var(--success)] animate-pulse" />
                      + $299.00 (Auto-renewal)
                    </div>
                    
                    {/* Mock chart area */}
                    <div className="mt-[var(--spacing-xl)] h-24 flex items-end gap-[var(--spacing-xs)] border-b border-[var(--hairline)] pb-2">
                       {[30, 40, 25, 50, 45, 70, 85].map((h, i) => (
                         <div key={i} className="flex-1 bg-[var(--canvas-paper)] rounded-t-[var(--radius-app-xs)] relative group">
                           <motion.div 
                             className={`absolute bottom-0 w-full rounded-t-[var(--radius-app-xs)] ${i === 6 ? 'bg-[var(--success)] shadow-[0_0_10px_rgba(55,205,132,0.4)]' : 'bg-[#e0e0e0]'}`}
                             initial={{ height: i === 6 ? '50%' : `${h}%` }}
                             animate={{ height: `${h}%` }}
                             transition={{ duration: 0.8, delay: i === 6 ? 0.3 : 0, type: "spring", bounce: 0.4 }}
                           />
                         </div>
                       ))}
                    </div>
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
