"use client";

import React from "react";

type Tone = "gray" | "gold" | "teal" | "rust";

const toneStyles: Record<Tone, React.CSSProperties> = {
  gray: { background: "rgba(138,143,152,0.15)", color: "var(--gray)" },
  gold: { background: "rgba(201,162,39,0.16)",  color: "var(--gold)" },
  teal: { background: "rgba(31,111,92,0.16)",   color: "var(--teal-soft)" },
  rust: { background: "rgba(180,67,45,0.16)",   color: "var(--rust-soft)" },
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
}

export function Badge({ tone = "gray", children }: BadgeProps) {
  return (
    <span className="badge mono" style={toneStyles[tone]}>
      {children}
    </span>
  );
}
