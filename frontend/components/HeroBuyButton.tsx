"use client";

import React, { useState } from "react";
import { Ticket } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";
import { type Currency } from "@/lib/api";

interface HeroBuyButtonProps {
  drawId?: string;
  currency?: Currency;
  price?: number;
}

export function HeroBuyButton({
  drawId = "RDL-ACTIVE",
  currency = "ETB",
  price = 100,
}: HeroBuyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BuyTicketModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialCurrency={currency}
        initialPrice={price}
        initialDrawId={drawId}
      />

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-base"
        style={{
          background: "linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)",
          color: "#111827",
          fontSize: "1.125rem",
          fontWeight: 900,
          padding: "12px 32px",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(234, 179, 8, 0.5)",
          border: "1.5px solid #FEF08A",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: "pointer",
        }}
      >
        BUY NOW
      </button>
    </>
  );
}
