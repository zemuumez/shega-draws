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
      className="card-base"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--gray-line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
