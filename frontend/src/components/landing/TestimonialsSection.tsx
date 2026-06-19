export function TestimonialsSection() {
  const testimonials = [
    {
      body: "NexUp Fit completely transformed how we operate. The WhatsApp automation alone saved us 20 hours a week chasing payments.",
      author: {
        name: 'Rahul Sharma',
        role: 'Owner, Iron Core Fitness',
        imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
      },
    },
    {
      body: "We switched from a clunky legacy system. The QR check-in is incredibly fast, and the dashboard gives me exactly what I need to see every morning.",
      author: {
        name: 'Priya Patel',
        role: 'Founder, Zen Studio',
        imageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
      },
    },
    {
      body: "Finally, a gym software that looks like it was built in this decade. Our members love the transparency, and I love the analytics.",
      author: {
        name: 'Vikram Singh',
        role: 'Director, The Lifting Club',
        imageUrl: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
      },
    },
  ];

  return (
    <section className="marketing-section-paper px-[var(--spacing-lg)]">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mx-auto max-w-xl text-center mb-[var(--spacing-section)]">
          <h2 className="text-mono-eyebrow text-[var(--mute)] mb-[var(--spacing-sm)] uppercase tracking-wider">Testimonials</h2>
          <p className="text-display-sm text-[var(--ink)]">
            Built for gym owners, loved by gym owners
          </p>
        </div>
        <div className="mx-auto mt-[var(--spacing-section)] max-w-6xl">
          <div className="grid grid-cols-1 gap-[var(--spacing-lg)] sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author.name} className="flex flex-col justify-between feature-card-light">
                <blockquote className="text-body text-[var(--ink-soft)] mb-[var(--spacing-lg)]">
                  "{testimonial.body}"
                </blockquote>
                <div className="flex items-center gap-[var(--spacing-sm)]">
                  <img className="h-10 w-10 rounded-[var(--radius-full)] bg-[var(--canvas-paper)]" src={testimonial.author.imageUrl} alt="" />
                  <div>
                    <div className="text-caption-tight text-[var(--ink)]">{testimonial.author.name}</div>
                    <div className="text-meta text-[var(--mute)]">{testimonial.author.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
