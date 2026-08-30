"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe, Trophy, Sparkles, HelpCircle, Ticket } from "lucide-react";
import { HowToBuyModal } from "./HowToBuyModal";
import { BuyTicketModal } from "./BuyTicketModal";
import { type Currency } from "@/lib/api";
import { type CMSJackpotCard } from "@/lib/sanity/queries";

interface JackpotCardsSectionProps {
  cmsCards?: CMSJackpotCard[];
}

function TicketOrnament() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        maxWidth: 220,
        margin: "6px auto 8px",
      }}
    >
      <div style={{ flex: "1 1 0%", height: 0, borderTop: "1.5px dotted rgba(17, 24, 39, 0.65)" }} />
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#111827", flexShrink: 0 }} />
      <div style={{ flex: "1 1 0%", height: 0, borderTop: "1.5px dotted rgba(17, 24, 39, 0.65)" }} />
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#111827", flexShrink: 0 }} />
      <div style={{ flex: "1 1 0%", height: 0, borderTop: "1.5px dotted rgba(17, 24, 39, 0.65)" }} />
    </div>
  );
}

export function JackpotCardsSection({ cmsCards }: JackpotCardsSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [isHowToBuyOpen, setIsHowToBuyOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedBuyTicket, setSelectedBuyTicket] = useState<{ currency: Currency; price: number; drawId: string }>({
    currency: "USD",
    price: 250,
    drawId: "RDL-USD-250",
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    mins: 35,
    secs: 20,
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const defaultJackpotTickets = [
    {
      id: "usd-250",
      serial: "RDL-USD-250",
      badgeTitle: "DIASPORA USD JACKPOT",
      badgeIcon: Globe,
      ticketPrice: 250,
      currency: "USD" as Currency,
      currSymbol: "$",
      grandPrize: "$1,250,000",
      drawDate: "Friday 18th July",
      poolLabels: ["1K", "3K", "5K"],
    },
    {
      id: "etb-200",
      serial: "RDL-ETB-200",
      badgeTitle: "200 BIRR HOLIDAY JACKPOT",
      badgeIcon: Trophy,
      ticketPrice: 200,
      currency: "ETB" as Currency,
      currSymbol: "ETB",
      grandPrize: "1,000,000 ETB",
      drawDate: "Friday 18th July",
      poolLabels: ["1K", "3K", "5K"],
    },
    {
      id: "etb-100",
      serial: "RDL-ETB-100",
      badgeTitle: "100 BIRR CLASSIC MULTI-POOL",
      badgeIcon: Sparkles,
      ticketPrice: 100,
      currency: "ETB" as Currency,
      currSymbol: "ETB",
      grandPrize: "500,000 ETB",
      drawDate: "Friday 18th July",
      poolLabels: ["1K", "2K", "3K", "5K"],
    },
  ];

  const jackpotTickets = (cmsCards && cmsCards.length > 0)
    ? cmsCards.map((c, idx) => ({
        id: c._id || `cms-${idx}`,
        serial: c.serial || `RDL-${c.currency || "ETB"}-${c.ticketPrice || 100}`,
        badgeTitle: c.badgeTitle || "SPECIAL JACKPOT",
        badgeIcon: c.currency === "USD" ? Globe : idx === 1 ? Trophy : Sparkles,
        ticketPrice: c.ticketPrice || 100,
        currency: (c.currency === "USD" ? "USD" : "ETB") as Currency,
        currSymbol: c.currency === "USD" ? "$" : "ETB",
        grandPrize: c.grandPrize || "500,000 ETB",
        drawDate: c.drawDate || "Friday 18th July",
        poolLabels: c.poolLabels && c.poolLabels.length > 0 ? c.poolLabels : ["1K", "2K", "3K", "5K"],
      }))
    : defaultJackpotTickets;

  const handleOpenBuy = (currency: Currency, price: number, drawId: string) => {
    setSelectedBuyTicket({ currency, price, drawId });
    setIsBuyModalOpen(true);
  };

  return (
    <>
      <HowToBuyModal
        isOpen={isHowToBuyOpen}
        onClose={() => setIsHowToBuyOpen(false)}
      />

      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialCurrency={selectedBuyTicket.currency}
        initialPrice={selectedBuyTicket.price}
        initialDrawId={selectedBuyTicket.drawId}
      />

      <section style={{ margin: "10px 0 20px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, width: "100%" }}>
          {jackpotTickets.map((ticket) => {
            const BadgeIcon = ticket.badgeIcon;

            return (
              <div
                key={ticket.id}
                className="casino-ticket-card"
              >
                {/* Inner Engraved Ticket Frame */}
                <div className="casino-ticket-inner">
                  {/* Perfectly Centered Top Dotted Security Ornament */}
                  <TicketOrnament />

                  {/* 3D Glossy Ruby Ribbon Badge */}
                  <div>
                    <span className="casino-ribbon-badge">
                      <BadgeIcon size={12} /> {ticket.badgeTitle}
                    </span>
                  </div>

                  {/* Next Jackpot Subtitle */}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#4B5563",
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    Next Grand Jackpot
                  </span>

                  {/* Massive Bold Black Typography Amount */}
                  <div
                    className="display"
                    style={{
                      fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)",
                      color: "#111827",
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: "-0.5px",
                      margin: "2px 0 4px",
                      textShadow: "0 1px 1px rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {ticket.grandPrize}
                  </div>

                  {/* Draw Release Date */}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {ticket.drawDate}
                  </span>

                  {/* Available Pools Pills */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 800, color: "#4B5563", textTransform: "uppercase" }}>
                      Pools:
                    </span>
                    {ticket.poolLabels.map((label, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(17, 24, 39, 0.2)",
                          borderRadius: 4,
                          padding: "1px 5px",
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* High-Contrast Live Countdown Clock */}
                  <div className="casino-countdown-strip">
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={12} color="#DC2626" /> Live Draw:
                    </span>
                    <span
                      className="mono"
                      suppressHydrationWarning
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "#DC2626",
                      }}
                    >
                      {mounted
                        ? `${String(timeLeft.days).padStart(2, "0")}d ${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.mins).padStart(2, "0")}m ${String(timeLeft.secs).padStart(2, "0")}s`
                        : "--"}
                    </span>
                  </div>

                  {/* Perfectly Centered Bottom Dotted Security Ornament */}
                  <TicketOrnament />

                  {/* Action Buttons: Dark Elegant "How to Buy" & Glossy Ruby "Buy Now" */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setIsHowToBuyOpen(true)}
                      className="casino-btn-dark"
                    >
                      <HelpCircle size={13} /> How to Buy
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBuy(ticket.currency, ticket.ticketPrice, ticket.serial)}
                      className="casino-btn-red"
                    >
                      <Ticket size={13} /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
