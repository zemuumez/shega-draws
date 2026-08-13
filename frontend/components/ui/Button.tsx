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
  primary:   { background: "var(--gold)",      color: "var(--ink)",  border: "none" },
  secondary: { background: "transparent",       color: "var(--paper)", border: "1px solid var(--gray-line)" },
  ghost:     { background: "transparent",       color: "var(--gray)",  border: "none" },
  danger:    { background: "transparent",       color: "var(--rust-soft)", border: "1px solid var(--rust)" },
  confirm:   { background: "var(--teal)",       color: "var(--paper)", border: "none" },
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
        ...(variant === "primary" && !disabled && !loading
          ? { boxShadow: "0 2px 12px rgba(201,162,39,0.25)" }
          : {}),
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
