"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  target: string | Date; // ISO string or Date
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
  const targetDate = target instanceof Date ? target : new Date(target);
  const [parts, setParts] = useState<TimeParts>(getParts(targetDate));

  useEffect(() => {
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
    <div role="timer" aria-label="Time until draw closes" style={{ display: "flex", gap: 16 }}>
      {labels.map(({ value, label }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div
            className="display"
            style={{
              fontSize: "1.75rem",
              color: "var(--paper)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              minWidth: 40,
            }}
          >
            {String(value).padStart(2, "0")}
          </div>
          <div
            className="mono"
            style={{ fontSize: "0.625rem", color: "var(--gray)", marginTop: 5, textTransform: "uppercase" }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
