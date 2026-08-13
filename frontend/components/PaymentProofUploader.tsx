"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle } from "lucide-react";

interface PaymentProofUploaderProps {
  onChange: (file: File) => void;
  preview?: string; // data URL
  fileName?: string;
}

const ACCEPTED = "image/jpeg,image/png,image/webp";

export function PaymentProofUploader({ onChange, preview, fileName }: PaymentProofUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    onChange(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label
        style={{ display: "block", fontSize: "0.75rem", color: "var(--gray)", marginBottom: 8, fontWeight: 500 }}
      >
        Payment screenshot
      </label>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload payment screenshot"
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragging ? "var(--gold)" : "var(--gray-line)"}`,
          borderRadius: "var(--radius-md)",
          padding: "20px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--gold-glow)" : "rgba(255,255,255,0.02)",
          transition: "border-color var(--transition-fast), background var(--transition-fast)",
          minHeight: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {preview ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Payment proof preview"
              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gray-line)" }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "var(--paper)", fontSize: "0.875rem" }}>{fileName}</div>
              <div style={{ color: "var(--teal-soft)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <CheckCircle size={12} /> Ready to submit
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--gray)", fontSize: "0.875rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Upload size={22} />
            <span>
              Tap or drag a screenshot here<br />
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>JPEG, PNG or WEBP · max 5 MB</span>
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: "none" }}
        aria-hidden="true"
        onChange={onInputChange}
      />
    </div>
  );
}
