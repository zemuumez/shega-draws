"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle, Image as ImageIcon } from "lucide-react";

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
        style={{
          display: "block",
          fontSize: "0.75rem",
          color: "#FEF08A",
          marginBottom: 8,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Payment Screenshot / SMS Proof
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
          border: `1.5px dashed ${dragging ? "#FDE047" : "rgba(253, 224, 71, 0.4)"}`,
          borderRadius: "14px",
          padding: "18px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "rgba(254, 240, 138, 0.1)" : "rgba(0, 0, 0, 0.45)",
          transition: "border-color 150ms ease, background 150ms ease",
          minHeight: 84,
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
              style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "1.5px solid #FDE047" }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 700 }}>{fileName || "screenshot.png"}</div>
              <div style={{ color: "#6EE7B7", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontWeight: 800 }}>
                <CheckCircle size={13} color="#34D399" /> Proof Ready to Submit
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#CBD5E1", fontSize: "0.875rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Upload size={20} color="#FDE047" />
            <span>
              Tap or drag payment receipt here<br />
              <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>JPEG, PNG, or WEBP (Max 5MB)</span>
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
