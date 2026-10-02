"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Dice5,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Ticket,
  Users,
  Trophy,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { accountAPI } from "@/lib/account-api";
import { publicAPI, type BackendDraw, type Order } from "@/lib/backend";
import { money } from "@/lib/admin";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import "@/styles/buy-ticket-flow.css";

interface BuyTicketFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  draw: BackendDraw;
}

export function BuyTicketFlowModal({
  isOpen,
  onClose,
  draw,
}: BuyTicketFlowModalProps) {
  const { text } = useLanguage();
  const { data: session } = authClient.useSession();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Player Details
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState(draw.currency === "USD" ? "+1" : "+251");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [step1Error, setStep1Error] = useState("");

  // Step 2: Number Picker
  const [selectedNumber, setSelectedNumber] = useState<number>(11);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [takenNumbers, setTakenNumbers] = useState<number[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [showPagePicker, setShowPagePicker] = useState(false);
  const [activeThousandIndex, setActiveThousandIndex] = useState(0);
  const [quickJumpInput, setQuickJumpInput] = useState("");
  const pagePickerRef = useRef<HTMLDivElement>(null);

  // Close calendar page picker on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pagePickerRef.current && !pagePickerRef.current.contains(e.target as Node)) {
        setShowPagePicker(false);
      }
    }
    if (showPagePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPagePicker]);

  // Step 3: Wallet Checkout
  const [walletBalance, setWalletBalance] = useState<{ availableMinor: number; balanceMinor: number; restricted: boolean } | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const PAGE_SIZE = 100;
  const totalPages = Math.ceil(draw.capacity / PAGE_SIZE);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepopulate player details from session
  useEffect(() => {
    if (session?.user?.name) {
      setFullName(session.user.name);
    }
  }, [session?.user?.name]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCountryCode(draw.currency === "USD" ? "+1" : "+251");
      setPhoneDigits("");
      setStep1Error("");
      setPurchaseError("");
      setConfirmedOrder(null);
      setSelectedNumber(11);
      setPage(0);
      setSearchQuery("");
    }
  }, [isOpen, draw]);

  // Fetch taken numbers for current page in draw
  useEffect(() => {
    if (!isOpen || step !== 2) return;
    let active = true;
    const controller = new AbortController();
    setLoadingAvailability(true);

    const from = page * PAGE_SIZE + 1;
    publicAPI<{ takenNumbers: number[]; remaining: number }>(
      `/draws/${encodeURIComponent(draw.id)}/availability?from=${from}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!active) return;
        setTakenNumbers(res.takenNumbers || []);
      })
      .catch(() => {
        if (active) setTakenNumbers([]);
      })
      .finally(() => {
        if (active) setLoadingAvailability(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, step, page, draw.id]);

  // Fetch wallet balance when entering Step 3
  useEffect(() => {
    if (!isOpen || step !== 3 || !session?.user?.id) return;
    let active = true;
    setLoadingWallet(true);
    setPurchaseError("");

    accountAPI<{ balances: Array<{ currency: string; availableMinor: number; balanceMinor: number; restricted: boolean }> }>(
      `/wallet?currency=${draw.currency}`
    )
      .then((res) => {
        if (!active) return;
        const b = res.balances?.find((x) => x.currency === draw.currency);
        setWalletBalance(b || { availableMinor: 0, balanceMinor: 0, restricted: false });
      })
      .catch((e) => {
        if (active) {
          setPurchaseError(e.message || "Failed to fetch wallet balance.");
          setWalletBalance({ availableMinor: 0, balanceMinor: 0, restricted: false });
        }
      })
      .finally(() => {
        if (active) setLoadingWallet(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, step, session?.user?.id, draw.currency]);

  // Taken number set for fast O(1) checks
  const takenSet = useMemo(() => new Set(takenNumbers), [takenNumbers]);

  // Numbers to display on current page
  const pageNumbers = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const results: number[] = [];
      for (let i = 1; i <= draw.capacity; i++) {
        if (String(i).includes(q)) {
          results.push(i);
          if (results.length >= 100) break;
        }
      }
      return results;
    }

    const start = page * PAGE_SIZE + 1;
    const end = Math.min(draw.capacity, start + PAGE_SIZE - 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) {
      nums.push(i);
    }
    return nums;
  }, [page, draw.capacity, searchQuery]);

  // Format full phone
  const formattedPhone = useMemo(() => {
    const cleaned = phoneDigits.replace(/\D/g, "").replace(/^0+/, "");
    return `${countryCode}${cleaned}`;
  }, [countryCode, phoneDigits]);

  // Handle Step 1 -> Step 2
  function handleContinueStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error("");

    if (!fullName.trim()) {
      setStep1Error("Please enter your full legal name.");
      return;
    }

    const cleanedDigits = phoneDigits.replace(/\D/g, "").replace(/^0+/, "");
    if (cleanedDigits.length < 7 || cleanedDigits.length > 14) {
      setStep1Error("Please enter a valid phone number (7 to 14 digits).");
      return;
    }

    const phoneRegex = /^\+[1-9][0-9]{7,14}$/;
    if (!phoneRegex.test(formattedPhone)) {
      setStep1Error("Invalid international phone format. Please check your country code and digits.");
      return;
    }

    setStep(2);
  }

  // Handle Pick Random Number
  function handlePickRandom() {
    // Generate a random number within capacity that is not taken
    let candidate = Math.floor(Math.random() * draw.capacity) + 1;
    setSelectedNumber(candidate);
    setSearchQuery("");
    setPage(Math.floor((candidate - 1) / PAGE_SIZE));
  }

  // Step 3: Confirm Wallet Purchase
  async function handleConfirmWalletPurchase() {
    if (!session) {
      setPurchaseError("Please log in to your account to purchase with your wallet balance.");
      return;
    }
    if (!session.user.emailVerified) {
      setPurchaseError("Email verification is required before making wallet ticket purchases.");
      return;
    }
    if (!walletBalance || walletBalance.availableMinor < draw.priceMinor) {
      setPurchaseError("Insufficient wallet balance. Please deposit funds first.");
      return;
    }

    setPurchasing(true);
    setPurchaseError("");

    try {
      const idempotencyKey = crypto.randomUUID();
      const order = await accountAPI<Order>("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          drawId: draw.id,
          number: selectedNumber,
          phone: formattedPhone,
          provider: "wallet",
        }),
      });

      setConfirmedOrder(order);
      setStep(4); // Success screen
    } catch (err: any) {
      setPurchaseError(err.message || "Failed to complete ticket purchase.");
    } finally {
      setPurchasing(false);
    }
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="flow-modal-overlay" onClick={onClose}>
      <div
        className="flow-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flow-modal-title"
      >
        {/* Header */}
        <div className="flow-modal-header">
          <button className="flow-close-btn" onClick={onClose} aria-label={text("Close")}>
            <X size={18} />
          </button>

          <div className="flow-header-tag">
            <span>{draw.currency === "USD" ? "DIASPORA USD TICKET" : "ETHIOPIA BIRR TICKET"}</span>
            <span>•</span>
            <span>#{draw.id}</span>
          </div>

          <h2 id="flow-modal-title" className="flow-header-title">
            {money(draw.priceMinor, draw.currency)} Entry Ticket
          </h2>

          <div className="flow-header-meta">
            <span>
              <Users size={14} color="#38BDF8" /> {draw.capacity.toLocaleString()} Capped Pool
            </span>
            <span>•</span>
            <span>
              <Trophy size={14} color="#FDE047" /> 10 Guaranteed Winners
            </span>
          </div>

          {/* 3-Step Progress Indicator */}
          {step <= 3 && (
            <div>
              <div className="flow-progress-bar-row">
                <div className={`flow-progress-segment ${step >= 1 ? "active" : ""}`} />
                <div className={`flow-progress-segment ${step >= 2 ? "active" : ""}`} />
                <div className={`flow-progress-segment ${step >= 3 ? "active" : ""}`} />
              </div>

              <div className="flow-progress-labels">
                <span className="flow-progress-step-text">
                  {step === 1 && "Step 1 of 3: Player Details"}
                  {step === 2 && "Step 2 of 3: Lucky Number"}
                  {step === 3 && "Step 3 of 3: Wallet Checkout"}
                </span>
                <span className="flow-progress-guarantee">10 Winners Guaranteed</span>
              </div>
            </div>
          )}
        </div>

        {/* ── STEP 1: PLAYER DETAILS ── */}
        {step === 1 && (
          <form onSubmit={handleContinueStep1} className="flow-step-container">
            <div className="flow-modal-body">
              <p className="flow-step-intro">
                Enter your player details so your winning cash payout can be transferred immediately upon live draw completion:
              </p>

              <div className="flow-form-group">
                <label className="flow-form-label" htmlFor="player-name">
                  YOUR FULL NAME
                </label>
                <input
                  id="player-name"
                  type="text"
                  required
                  className="flow-input"
                  placeholder="e.g. Zemichael Tefera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="flow-form-group">
                <label className="flow-form-label" htmlFor="player-phone">
                  PHONE NUMBER (TELEBIRR REGISTERED)
                </label>
                <div className="flow-phone-row">
                  <select
                    className="flow-phone-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="+251">ET +251</option>
                    <option value="+1">US +1</option>
                    <option value="+44">UK +44</option>
                    <option value="+49">DE +49</option>
                    <option value="+33">FR +33</option>
                    <option value="+971">AE +971</option>
                    <option value="+254">KE +254</option>
                    <option value="+249">SD +249</option>
                  </select>

                  <input
                    id="player-phone"
                    type="tel"
                    required
                    className="flow-input"
                    placeholder={countryCode === "+251" ? "911234567" : "2113123123"}
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                  />
                </div>
              </div>

              {step1Error && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#F87171", fontSize: "0.8125rem", marginTop: "12px" }}>
                  <AlertCircle size={16} />
                  <span>{step1Error}</span>
                </div>
              )}
            </div>

            <div className="flow-modal-footer" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="flow-continue-btn">
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: LUCKY NUMBER SELECTION ── */}
        {step === 2 && (
          <div className="flow-step-container">
            <div className="flow-modal-body">
              <p className="flow-step-intro">
                Choose a number from 1 to {draw.capacity.toLocaleString()}. Submitted numbers are disabled.
              </p>

              {/* Selected Lucky Number Card */}
              <div className="flow-selected-number-card">
                <div className="flow-selected-number-header">
                  <div>
                    <div style={{ color: "#94A3B8", fontSize: "0.725rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>
                      SELECTED LUCKY TICKET NUMBER
                    </div>
                    <div className="flow-selected-box">
                      #{selectedNumber}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: takenSet.has(selectedNumber) ? "#EF4444" : "#34D399", fontWeight: 800, fontSize: "0.875rem" }}>
                      {takenSet.has(selectedNumber) ? (
                        <>
                          <AlertCircle size={16} />
                          <span>Number Taken</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Available to Pick</span>
                        </>
                      )}
                    </div>
                    <small style={{ color: "#64748B", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                      Pool Range: #1 to #{draw.capacity.toLocaleString()}
                    </small>
                  </div>
                </div>

                <button type="button" className="flow-pick-random-btn" onClick={handlePickRandom}>
                  <Dice5 size={18} />
                  <span>Pick Random Number</span>
                </button>
              </div>

              {/* Search & Pagination Bar */}
              <div className="flow-search-bar">
                <div className="flow-search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    className="flow-input"
                    placeholder={`Search number (1 - ${draw.capacity})`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {!searchQuery && (
                  <div style={{ position: "relative" }} ref={pagePickerRef}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        className="flow-page-nav-btn"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        title={text("Previous 100 numbers")}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <button
                        type="button"
                        className={`flow-page-calendar-trigger ${showPagePicker ? "active" : ""}`}
                        onClick={() => {
                          setActiveThousandIndex(Math.floor(page / 10));
                          setShowPagePicker((prev) => !prev);
                        }}
                        title={text("Click to choose numbers page like a calendar")}
                        aria-label="Choose numbers page"
                      >
                        <Calendar size={14} color="#FDE047" />
                        <span>
                          #{page * PAGE_SIZE + 1} – #{Math.min(draw.capacity, (page + 1) * PAGE_SIZE)}
                        </span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: showPagePicker ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                          }}
                        />
                      </button>

                      <button
                        type="button"
                        className="flow-page-nav-btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        title={text("Next 100 numbers")}
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Calendar-style Page Picker Popover */}
                    {showPagePicker && (
                      <div className="flow-calendar-dropdown-popover">
                        <div className="flow-calendar-popover-header">
                          <span className="flow-calendar-popover-title">
                            <Calendar size={13} color="#FDE047" />
                            <span>{text("Choose Number Range")}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPagePicker(false)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94A3B8",
                              cursor: "pointer",
                              padding: "2px",
                              display: "flex",
                            }}
                            aria-label="Close"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Thousands Selector (Decade/Thousands row) */}
                        {Math.ceil(draw.capacity / 1000) > 1 && (
                          <div>
                            <div style={{ color: "#94A3B8", fontSize: "0.6875rem", fontWeight: 700, marginBottom: "4px" }}>
                              {text("THOUSANDS POOL")}
                            </div>
                            <div className="flow-calendar-thousands-bar">
                              {Array.from({ length: Math.ceil(draw.capacity / 1000) }, (_, idx) => {
                                const tStart = idx * 1000 + 1;
                                const tEnd = Math.min(draw.capacity, (idx + 1) * 1000);
                                const isCurrent = activeThousandIndex === idx;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    className={`flow-calendar-thousand-chip ${isCurrent ? "active" : ""}`}
                                    onClick={() => setActiveThousandIndex(idx)}
                                  >
                                    #{tStart.toLocaleString()} – #{tEnd.toLocaleString()}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 100-Numbers Pages Grid */}
                        <div>
                          <div style={{ color: "#94A3B8", fontSize: "0.6875rem", fontWeight: 700, marginBottom: "4px" }}>
                            {text("PAGES (100 NUMBERS EACH)")}
                          </div>
                          <div className="flow-calendar-pages-grid">
                            {Array.from({ length: 10 }, (_, pIdx) => {
                              const pNumber = activeThousandIndex * 10 + pIdx;
                              if (pNumber >= totalPages) return null;
                              const pStart = pNumber * PAGE_SIZE + 1;
                              const pEnd = Math.min(draw.capacity, (pNumber + 1) * PAGE_SIZE);
                              const isSelected = page === pNumber;
                              return (
                                <button
                                  key={pNumber}
                                  type="button"
                                  className={`flow-calendar-page-cell ${isSelected ? "selected" : ""}`}
                                  onClick={() => {
                                    setPage(pNumber);
                                    setShowPagePicker(false);
                                  }}
                                >
                                  {isSelected && <Check size={13} color="#FDE047" />}
                                  <span>#{pStart} – #{pEnd}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Direct Jump to Number Input */}
                        <div className="flow-calendar-jump-box">
                          <input
                            type="number"
                            min={1}
                            max={draw.capacity}
                            placeholder={`Jump directly to # (1 - ${draw.capacity})`}
                            className="flow-calendar-jump-input"
                            value={quickJumpInput}
                            onChange={(e) => setQuickJumpInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = parseInt(quickJumpInput.trim(), 10);
                                if (!isNaN(val) && val >= 1 && val <= draw.capacity) {
                                  const targetPage = Math.floor((val - 1) / PAGE_SIZE);
                                  setPage(targetPage);
                                  setSelectedNumber(val);
                                  setShowPagePicker(false);
                                  setQuickJumpInput("");
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="flow-calendar-jump-btn"
                            onClick={() => {
                              const val = parseInt(quickJumpInput.trim(), 10);
                              if (!isNaN(val) && val >= 1 && val <= draw.capacity) {
                                const targetPage = Math.floor((val - 1) / PAGE_SIZE);
                                setPage(targetPage);
                                setSelectedNumber(val);
                                setShowPagePicker(false);
                                setQuickJumpInput("");
                              }
                            }}
                          >
                            {text("Go")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selectable Numbers Grid */}
              <div>
                <div className="flow-grid-header">
                  <span>SELECTABLE NUMBERS ({draw.capacity.toLocaleString()} TOTAL POOL SLOTS)</span>
                  <div className="flow-grid-legend">
                    <span><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#475569" }} /> Available</span>
                    <span><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} /> Taken</span>
                    <span><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FDE047" }} /> Selected</span>
                  </div>
                </div>

                {loadingAvailability ? (
                  <p style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0" }}>
                    Loading available numbers…
                  </p>
                ) : (
                  <div className="flow-numbers-grid">
                    {pageNumbers.map((num) => {
                      const isTaken = takenSet.has(num);
                      const isSelected = selectedNumber === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isTaken}
                          onClick={() => setSelectedNumber(num)}
                          className={`flow-num-btn ${isSelected ? "selected" : ""} ${isTaken ? "taken" : ""}`}
                        >
                          {String(num).padStart(2, "0")}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flow-modal-footer">
              <button type="button" className="flow-back-btn" onClick={() => setStep(1)}>
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="flow-continue-btn"
                disabled={takenSet.has(selectedNumber)}
                onClick={() => setStep(3)}
              >
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: WALLET CHECKOUT & BALANCE DEDUCTION ── */}
        {step === 3 && (
          <div className="flow-step-container">
            <div className="flow-modal-body">
              <p className="flow-step-intro">
                Review your entry ticket details and confirm purchase. The ticket cost will be automatically checked and deducted from your verified wallet balance:
              </p>

              {/* Ticket Order Summary */}
              <div className="flow-summary-box">
                <div className="flow-summary-row">
                  <span className="flow-summary-label">Lottery Draw</span>
                  <span className="flow-summary-val">{draw.title}</span>
                </div>
                <div className="flow-summary-row">
                  <span className="flow-summary-label">Chosen Lucky Number</span>
                  <span className="flow-summary-val" style={{ color: "#FDE047", fontSize: "1.1rem" }}>
                    #{selectedNumber}
                  </span>
                </div>
                <div className="flow-summary-row">
                  <span className="flow-summary-label">Ticket Entry Fee</span>
                  <span className="flow-summary-val" style={{ color: "#FDE047" }}>
                    {money(draw.priceMinor, draw.currency)}
                  </span>
                </div>
                <div className="flow-summary-row">
                  <span className="flow-summary-label">Player Name</span>
                  <span className="flow-summary-val">{fullName}</span>
                </div>
                <div className="flow-summary-row">
                  <span className="flow-summary-label">Registered Phone</span>
                  <span className="flow-summary-val">{formattedPhone}</span>
                </div>
              </div>

              {/* Wallet Account Balance Check */}
              {!session ? (
                <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1.5px solid #F59E0B", borderRadius: "14px", padding: "18px", textAlign: "center" }}>
                  <AlertCircle size={28} color="#FBBF24" style={{ margin: "0 auto 8px" }} />
                  <strong style={{ color: "#FDE047", display: "block", marginBottom: "6px" }}>
                    Account Login Required for Wallet Checkout
                  </strong>
                  <p style={{ color: "#D1D5DB", fontSize: "0.8125rem", margin: "0 0 16px" }}>
                    Please sign in or create an account to use your wallet balance for ticket purchases.
                  </p>
                  <Link
                    href={`/login?redirect=${encodeURIComponent("/")}`}
                    className="casino-btn-gold"
                    style={{ display: "inline-block", padding: "10px 24px", fontSize: "0.875rem", textDecoration: "none" }}
                  >
                    Log In to Continue
                  </Link>
                </div>
              ) : loadingWallet ? (
                <p style={{ textAlign: "center", color: "#94A3B8", padding: "16px 0" }}>
                  Checking available wallet balance…
                </p>
              ) : (
                <div className="flow-wallet-check-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Wallet size={18} color="#FDE047" />
                    <strong style={{ color: "#FDE047", fontSize: "0.95rem" }}>
                      My {draw.currency} Wallet Balance
                    </strong>
                  </div>

                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Available Balance</span>
                    <strong style={{ color: walletBalance && walletBalance.availableMinor >= draw.priceMinor ? "#34D399" : "#F87171" }}>
                      {money(walletBalance?.availableMinor || 0, draw.currency)}
                    </strong>
                  </div>

                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Ticket Price</span>
                    <span style={{ color: "#F87171" }}>
                      -{money(draw.priceMinor, draw.currency)}
                    </span>
                  </div>

                  {walletBalance && walletBalance.availableMinor >= draw.priceMinor ? (
                    <div className="flow-summary-row">
                      <span className="flow-summary-label">Balance After Purchase</span>
                      <strong style={{ color: "#FFFFFF" }}>
                        {money(walletBalance.availableMinor - draw.priceMinor, draw.currency)}
                      </strong>
                    </div>
                  ) : (
                    <div style={{ marginTop: "14px", padding: "12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #EF4444", borderRadius: "8px" }}>
                      <div style={{ display: "flex", gap: "8px", color: "#FCA5A5", fontSize: "0.8125rem", alignItems: "flex-start" }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <strong>Insufficient wallet balance.</strong>
                          <p style={{ margin: "4px 0 8px" }}>
                            You need {money(draw.priceMinor, draw.currency)}, but your available balance is {money(walletBalance?.availableMinor || 0, draw.currency)}.
                          </p>
                          <Link
                            href="/profile#wallet"
                            target="_blank"
                            style={{ color: "#FDE047", fontWeight: 800, textDecoration: "underline" }}
                          >
                            Deposit Funds in My Wallet →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {purchaseError && (
                <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#F87171", fontSize: "0.8125rem", marginTop: "12px" }}>
                  <AlertCircle size={16} />
                  <span>{purchaseError}</span>
                </div>
              )}
            </div>

            <div className="flow-modal-footer">
              <button type="button" className="flow-back-btn" onClick={() => setStep(2)}>
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="flow-continue-btn"
                disabled={
                  !session ||
                  loadingWallet ||
                  purchasing ||
                  !walletBalance ||
                  walletBalance.availableMinor < draw.priceMinor
                }
                onClick={handleConfirmWalletPurchase}
              >
                <span>{purchasing ? "Processing Purchase…" : `Confirm & Deduct ${money(draw.priceMinor, draw.currency)}`}</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS CONFIRMATION ── */}
        {step === 4 && confirmedOrder && (
          <div className="flow-step-container">
            <div className="flow-modal-body">
              <div className="flow-success-box">
                <div className="flow-success-icon">
                  <CheckCircle2 size={36} />
                </div>

                <span className="status-badge-pill verified" style={{ display: "inline-flex", marginBottom: "12px" }}>
                  <Check size={14} /> Confirmed Order
                </span>

                <h3 style={{ color: "#FFFFFF", fontSize: "1.5rem", margin: "0 0 8px" }}>
                  Ticket Purchased Successfully!
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "0 0 24px" }}>
                  The entry fee was successfully deducted from your wallet balance. Your ticket is locked in for the live video draw.
                </p>

                <div className="flow-summary-box" style={{ textAlign: "left", marginBottom: "24px" }}>
                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Order ID</span>
                    <code style={{ color: "#FDE047", fontSize: "0.8125rem" }}>{confirmedOrder.id}</code>
                  </div>
                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Your Lucky Number</span>
                    <strong style={{ color: "#FDE047", fontSize: "1.25rem" }}>#{confirmedOrder.number}</strong>
                  </div>
                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Lottery Draw</span>
                    <span className="flow-summary-val">{draw.title}</span>
                  </div>
                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Amount Paid</span>
                    <span className="flow-summary-val">{money(confirmedOrder.amountMinor, confirmedOrder.currency)}</span>
                  </div>
                  <div className="flow-summary-row">
                    <span className="flow-summary-label">Payment Method</span>
                    <span className="flow-summary-val" style={{ color: "#34D399" }}>Wallet Balance</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link
                    href="/my-tickets"
                    className="casino-btn-gold"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", textDecoration: "none" }}
                    onClick={onClose}
                  >
                    <Ticket size={16} />
                    <span>View in My Tickets</span>
                  </Link>

                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "12px 24px",
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
