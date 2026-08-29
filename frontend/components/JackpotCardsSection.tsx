"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe, Trophy, Sparkles, HelpCircle, Ticket } from "lucide-react";
import { HowToBuyModal } from "./HowToBuyModal";
import { BuyTicketModal } from "./BuyTicketModal";
import { type Currency } from "@/lib/api";

function TicketOrnament() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        maxWidth: 240,
        margin: "6px auto 10px",
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

export function JackpotCardsSection() {
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

  const jackpotTickets = [
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

      <section style={{ margin: "24px 0 32px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20, width: "100%" }}>
          {jackpotTickets.map((ticket) => {
            const BadgeIcon = ticket.badgeIcon;

            return (
              <div
                key={ticket.id}
                className="gold-admission-ticket"
              >
                {/* Inner Engraved Ticket Frame */}
                <div className="gold-ticket-inner-frame">
                  {/* Perfectly Centered Top Dotted Security Ornament */}
                  <TicketOrnament />

                  {/* Badge Header Tag */}
                  <span
                    style={{
                      background: "rgba(17, 24, 39, 0.08)",
                      border: "1px solid rgba(17, 24, 39, 0.2)",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "0.625rem",
                      fontWeight: 900,
                      color: "#111827",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 6,
                    }}
                  >
                    <BadgeIcon size={12} /> {ticket.badgeTitle}
                  </span>

                  {/* Next Jackpot Subtitle */}
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "#4B5563",
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    Next Jackpot
                  </span>

                  {/* Massive Bold Black Typography Amount */}
                  <div
                    className="display"
                    style={{
                      fontSize: "clamp(1.75rem, 3.2vw, 2.3rem)",
                      color: "#111827",
                      fontWeight: 900,
                      lineHeight: 1.1,
                      letterSpacing: "-0.5px",
                      margin: "2px 0 6px",
                      textShadow: "0 1px 1px rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {ticket.grandPrize}
                  </div>

                  {/* Draw Release Date */}
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "#374151",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    {ticket.drawDate}
                  </span>

                  {/* Available Pools Pills */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
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
                          padding: "1px 6px",
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Live Countdown Clock (Restored Previous Style) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255, 255, 255, 0.9)",
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(17, 24, 39, 0.15)",
                      margin: "4px 0 8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
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
                      <Clock size={12} color="#DC2626" /> Next Draw:
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

                  {/* Action Buttons: Dark Elegant "How to Buy" & Glossy Red "Buy Now" */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setIsHowToBuyOpen(true)}
                      className="gold-ticket-btn-dark"
                    >
                      <HelpCircle size={14} /> How to Buy
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBuy(ticket.currency, ticket.ticketPrice, ticket.serial)}
                      className="gold-ticket-btn-red"
                    >
                      <Ticket size={14} /> Buy Now
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
