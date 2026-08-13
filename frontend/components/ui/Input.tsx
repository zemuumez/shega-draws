"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, style, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: "0.75rem", color: "var(--gray)", fontWeight: 500 }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className="input-base"
        style={{
          borderColor: error ? "var(--rust)" : undefined,
          ...style,
        }}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" style={{ fontSize: "0.75rem", color: "var(--rust-soft)" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} style={{ fontSize: "0.75rem", color: "var(--gray)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
