'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Do I need technical knowledge to use NexUp Fit?",
    answer: "Not at all. We've designed NexUp Fit to be as intuitive as the apps you use every day. If you can use WhatsApp, you can run your gym on our platform.",
  },
  {
    question: "How long does it take to migrate my existing data?",
    answer: "Usually less than 24 hours. Our onboarding team will help you import all your members, active subscriptions, and historical data from Excel or your old software.",
  },
  {
    question: "Is the QR check-in system really that fast?",
    answer: "Yes! The scan takes less than a second, works offline on the member's phone, and updates your dashboard instantly.",
  },
  {
    question: "Do you charge per member?",
    answer: "Our Starter and Growth plans have generous member limits designed for 90% of gyms. The Enterprise plan has absolutely no limits.",
  },
  {
    question: "What happens if I need help?",
    answer: "We offer priority support via WhatsApp and email. Enterprise customers get a dedicated account manager.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="marketing-section-paper px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mx-auto max-w-4xl border-t border-[var(--hairline)] pt-[var(--spacing-section)]">
          <div className="text-center mb-[var(--spacing-section)]">
            <h2 className="text-display-md text-[var(--ink)] mb-[var(--spacing-md)]">Frequently asked questions</h2>
            <p className="text-subtitle text-[var(--ink-soft)]">Everything you need to know about NexUp Fit.</p>
          </div>
          
          <dl className="mt-10 space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="feature-card-light">
                <dt>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-start justify-between text-left text-[var(--ink)]"
                  >
                    <span className="text-heading-sm">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <ChevronDown
                        className={`h-6 w-6 text-[var(--mute)] transform transition-transform duration-200 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </dt>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.dd
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-[var(--spacing-md)] pr-12 overflow-hidden"
                    >
                      <p className="text-body text-[var(--ink-soft)]">{faq.answer}</p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
