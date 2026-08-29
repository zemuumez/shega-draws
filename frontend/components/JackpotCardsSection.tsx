"use client";

import React, { useState, useEffect } from "react";
import { Clock, Trophy, Sparkles, Globe, Ticket, HelpCircle, Calendar, Users } from "lucide-react";
import { HowToBuyModal } from "./HowToBuyModal";
import { BuyTicketModal } from "./BuyTicketModal";
import { type Currency } from "@/lib/api";

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
      title: "$250 Grand Diaspora Tier",
      ticketPrice: 250,
      currency: "USD" as Currency,
      currSymbol: "$",
      grandPrize: "$1,250,000",
      topPrizeText: "$400,000 for 1st Place",
      drawDate: "Aug 31, 2026",
      poolLabels: ["1K", "3K", "5K"],
    },
    {
      id: "etb-200",
      serial: "RDL-ETB-200",
      badgeTitle: "LOCAL ETB JACKPOT",
      badgeIcon: Trophy,
      title: "200 Birr Grand Holiday Jackpot",
      ticketPrice: 200,
      currency: "ETB" as Currency,
      currSymbol: "ETB",
      grandPrize: "1,000,000 ETB",
      topPrizeText: "320,000 ETB for 1st Place",
      drawDate: "Aug 31, 2026",
      poolLabels: ["1K", "3K", "5K"],
    },
    {
      id: "etb-100",
      serial: "RDL-ETB-100",
      badgeTitle: "POPULAR MULTI-POOL",
      badgeIcon: Sparkles,
      title: "100 Birr Classic Multi-Pool",
      ticketPrice: 100,
      currency: "ETB" as Currency,
      currSymbol: "ETB",
      grandPrize: "500,000 ETB",
      topPrizeText: "160,000 ETB for 1st Place",
      drawDate: "Aug 31, 2026",
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

      <section style={{ margin: "24px 0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 16 }}>
          {jackpotTickets.map((ticket) => {
            const BadgeIcon = ticket.badgeIcon;

            return (
              <div
                key={ticket.id}
                className="physical-lottery-ticket animate-fade"
                style={{
                  background: "#FFFDF7",
                  border: "1.5px solid #FDE047",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow: "0 6px 18px -4px rgba(234, 179, 8, 0.2)",
                  display: "grid",
                  gridTemplateColumns: "1fr 115px",
                  position: "relative",
                }}
              >
                {/* Left Ticket Body */}
                <div style={{ padding: "16px 16px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Top Bar: Badge & Date (No Emojis) */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span
                        style={{
                          background: ticket.currency === "USD" ? "var(--blue-bg)" : "#FEF9C3",
                          color: ticket.currency === "USD" ? "#2A65E6" : "var(--gold-deep)",
                          border: `1px solid ${ticket.currency === "USD" ? "var(--blue-border)" : "#FDE047"}`,
                          padding: "2px 7px",
                          borderRadius: "5px",
                          fontSize: "0.625rem",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          letterSpacing: "0.4px",
                        }}
                      >
                        <BadgeIcon size={11} /> {ticket.badgeTitle}
                      </span>

                      <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={11} color="var(--blue-navy)" /> {ticket.drawDate}
                      </span>
                    </div>

                    <h3 className="display" style={{ fontSize: "1.05rem", color: "var(--blue-navy)", fontWeight: 800, lineHeight: 1.2, margin: "2px 0 1px" }}>
                      {ticket.title}
                    </h3>

                    {/* Grand Prize Total */}
                    <div className="display" style={{ fontSize: "1.45rem", color: "var(--gold-deep)", fontWeight: 900, lineHeight: 1.15 }}>
                      {ticket.grandPrize}
                    </div>

                    <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--teal-dark)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, margin: "2px 0 8px" }}>
                      <Trophy size={11} color="var(--gold-dark)" /> 10 Winners · {ticket.topPrizeText}
                    </span>

                    {/* Compact Available Pools */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
                        Pools:
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {ticket.poolLabels.map((label, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid #E2E8F0",
                              borderRadius: 4,
                              padding: "1px 6px",
                              fontSize: "0.625rem",
                              fontWeight: 800,
                              color: "var(--blue-navy)",
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Live Countdown Clock */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", padding: "4px 8px", borderRadius: 6, border: "1px solid #E2E8F0" }}>
                      <span className="mono" style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} color="#DC2626" /> Live Draw:
                      </span>
                      <span className="mono" suppressHydrationWarning style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#DC2626" }}>
                        {mounted ? `${String(timeLeft.days).padStart(2, "0")}d ${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.mins).padStart(2, "0")}m` : "--"}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setIsHowToBuyOpen(true)}
                      className="btn-base"
                      style={{
                        background: "#F1F5F9",
                        border: "1px solid #CBD5E1",
                        color: "var(--blue-navy)",
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                        padding: "6px 4px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        justifyContent: "center",
                        gap: 3,
                      }}
                    >
                      <HelpCircle size={11} /> How to Buy Ticket
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBuy(ticket.currency, ticket.ticketPrice, ticket.serial)}
                      className="btn-base"
                      style={{
                        background: "linear-gradient(135deg, #FDE047 0%, #EAB308 100%)",
                        color: "#0C2666",
                        fontSize: "0.6875rem",
                        fontWeight: 900,
                        padding: "6px 4px",
                        borderRadius: "6px",
                        boxShadow: "0 2px 6px rgba(234, 179, 8, 0.3)",
                        border: "1px solid #FEF08A",
                        cursor: "pointer",
                        justifyContent: "center",
                        gap: 3,
                      }}
                    >
                      <Ticket size={11} /> Buy Now
                    </button>
                  </div>
                </div>

                {/* Right Perforated Ticket Stub */}
                <div
                  style={{
                    background: "var(--bg-ticket-stub)",
                    borderLeft: "2px dashed #CBD5E1",
                    padding: "14px 8px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <div>
                    <span className="mono" style={{ fontSize: "0.5rem", color: "#2A65E6", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      RIMNA LOTTERY
                    </span>
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #FDE047",
                        borderRadius: 5,
                        padding: "4px 4px",
                        marginTop: 4,
                      }}
                    >
                      <span className="mono" style={{ fontSize: "0.5rem", color: "var(--text-subtle)", display: "block" }}>
                        PRICE
                      </span>
                      <span className="display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--gold-deep)", lineHeight: 1 }}>
                        {ticket.currency === "USD" ? `$${ticket.ticketPrice}` : `${ticket.ticketPrice}`}
                      </span>
                      <span className="mono" style={{ fontSize: "0.5rem", color: "var(--text-muted)", display: "block" }}>
                        {ticket.currSymbol}
                      </span>
                    </div>
                  </div>

                  <div style={{ width: "100%" }}>
                    <div className="barcode-pattern" style={{ height: 22, marginBottom: 3 }} />
                    <span className="mono" style={{ fontSize: "0.5rem", color: "var(--text-subtle)", display: "block" }}>
                      {ticket.serial}
                    </span>
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
