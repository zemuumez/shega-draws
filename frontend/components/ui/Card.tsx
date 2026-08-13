"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glass?: boolean;
}

export function Card({ children, style, glass }: CardProps) {
  return (
    <div
      className={glass ? "glass-card" : undefined}
      style={{
        background: glass ? undefined : "var(--ink-soft)",
        border: "1px solid var(--gray-line)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
