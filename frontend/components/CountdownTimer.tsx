"use client";

import { useEffect, useState, useMemo } from "react";

interface CountdownTimerProps {
  target: string | Date;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getParts(target: Date): TimeParts {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({ target }: CountdownTimerProps) {
  const targetDate = useMemo(() => (target instanceof Date ? target : new Date(target)), [target]);
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState<TimeParts>({ days: 3, hours: 8, minutes: 24, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setParts(getParts(targetDate));
    const interval = setInterval(() => setParts(getParts(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const labels = [
    { value: parts.days,    label: "days" },
    { value: parts.hours,   label: "hrs" },
    { value: parts.minutes, label: "min" },
    { value: parts.seconds, label: "sec" },
  ];

  return (
    <div role="timer" aria-label="Time until draw closes" style={{ display: "flex", gap: 14 }}>
      {labels.map(({ value, label }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div
            className="mono"
            suppressHydrationWarning
            style={{
              fontSize: "1.625rem",
              fontWeight: 800,
              color: "var(--text-main)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              minWidth: 38,
              background: "#FFFFFF",
              border: "1px solid var(--gray-line)",
              borderRadius: 8,
              padding: "6px 8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {mounted ? String(value).padStart(2, "0") : "--"}
          </div>
          <div
            className="mono"
            style={{
              fontSize: "0.625rem",
              color: "var(--text-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginTop: 4,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
