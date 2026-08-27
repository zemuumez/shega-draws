"use client";

import React from "react";

type Tone = "gray" | "gold" | "teal" | "rust";

const toneClasses: Record<Tone, string> = {
  gray: "badge-gray",
  gold: "badge-gold",
  teal: "badge-teal",
  rust: "badge-rust",
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
}

export function Badge({ tone = "gray", children }: BadgeProps) {
  return (
    <span className={`badge mono ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
