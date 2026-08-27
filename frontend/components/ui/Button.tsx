"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "confirm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: React.ElementType;
  full?: boolean;
  loading?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary:   { background: "var(--gold)",      color: "#FFFFFF",        border: "none", boxShadow: "0 2px 8px rgba(217,119,6,0.28)" },
  secondary: { background: "#FFFFFF",          color: "var(--text-main)", border: "1px solid var(--gray-line)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  ghost:     { background: "transparent",       color: "var(--text-muted)", border: "none" },
  danger:    { background: "var(--rust-bg)",    color: "var(--rust-dark)", border: "1px solid var(--rust-border)" },
  confirm:   { background: "var(--teal)",       color: "#FFFFFF",        border: "none" },
};

export function Button({
  variant = "primary",
  icon: Icon,
  full,
  loading,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className="btn-base"
      style={{
        ...styles[variant],
        width: full ? "100%" : "auto",
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
          }}
          className="animate-spin"
        />
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}
