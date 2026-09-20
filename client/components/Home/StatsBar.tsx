'use client';

import React, { useEffect, useRef, useState } from 'react';

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span
      ref={ref}
      className="font-serif text-3xl font-bold md:text-5xl text-[#a62025] tracking-tight"
    >
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  const stats = [
    { value: 5000, suffix: '+', label: 'Alumni Worldwide' },
    { value: 200, suffix: '+', label: 'Top Recruiters' },
    { value: 72, suffix: ' LPA', label: 'Highest Package' },
    { value: 30, suffix: '+', label: 'Years of Legacy' },
  ];

  return (
    <section
      className="bg-white border-b border-gray-200/80 w-full"
      aria-label="BFCET by the numbers"
    >
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-gray-200">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <CountUp target={stat.value} suffix={stat.suffix} />
              <span className="mt-2 text-xs md:text-sm text-gray-550 font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsBar;
