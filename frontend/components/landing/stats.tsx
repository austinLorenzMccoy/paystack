"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "$10K+", label: "Revenue Processed" },
  { value: "50+", label: "Active Creators" },
  { value: "20%", label: "AI Agent Payments" },
  { value: "100%", label: "Uptime" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-y-2 border-border bg-background px-6 py-16"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, var(--concrete) 1px, var(--concrete) 2px)`,
        backgroundSize: "100% 40px",
      }}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: `all 0.5s ease ${index * 0.1}s`,
            }}
          >
            <div className="mb-2 font-mono text-4xl font-extrabold text-bitcoin-orange md:text-5xl">
              {stat.value}
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-fog">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
