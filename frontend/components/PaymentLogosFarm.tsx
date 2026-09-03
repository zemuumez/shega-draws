"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface PaymentLogo {
  id: string;
  name: string;
  src: string;
}

const PAYMENT_LOGOS: PaymentLogo[] = [
  { id: "logo-16", name: "Telebirr", src: "/images/payment-logos/16.png" },
  { id: "logo-17", name: "Commercial Bank of Ethiopia (CBE)", src: "/images/payment-logos/17.png" },
  { id: "logo-18", name: "Bank of Abyssinia", src: "/images/payment-logos/18.png" },
  { id: "logo-19", name: "Awash Bank", src: "/images/payment-logos/19.png" },
  { id: "logo-20", name: "Dashen Bank", src: "/images/payment-logos/20.png" },
  { id: "logo-21", name: "Visa", src: "/images/payment-logos/21.png" },
  { id: "logo-22", name: "Mastercard", src: "/images/payment-logos/22.png" },
  { id: "logo-23", name: "Chapa Payment Gateway", src: "/images/payment-logos/23.png" },
  { id: "logo-24", name: "International Wire / Settlement", src: "/images/payment-logos/24.png" },
];

// Duplicate list for seamless horizontal scrolling coverage
const ALL_LOGOS = [...PAYMENT_LOGOS, ...PAYMENT_LOGOS];

export function PaymentLogosFarm() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Allow standard mouse wheel to scroll horizontally inside this container
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // Mouse drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <style>{`
        .payment-scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        .payment-scroll-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.04);
          border-radius: 4px;
        }
        .payment-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.4);
          border-radius: 4px;
        }
        .payment-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.7);
        }
      `}</style>

      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          padding: "0 clamp(12px, 3vw, 24px)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Horizontal Hover-Scrollable Track with Strict Uniform Height & Width for All Logos */}
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="payment-scroll-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(16px, 2vw, 24px)",
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: isDragging ? "auto" : "smooth",
            cursor: isDragging ? "grabbing" : "grab",
            padding: "8px 4px 12px",
            userSelect: "none",
            WebkitOverflowScrolling: "touch",
            maskImage: "linear-gradient(to right, transparent, black 1.5%, black 98.5%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 1.5%, black 98.5%, transparent)",
          }}
        >
          {ALL_LOGOS.map((logo, idx) => (
            <div
              key={`${logo.id}-${idx}`}
              title={logo.name}
              style={{
                height: "clamp(64px, 7vw, 76px)",
                width: "clamp(160px, 15vw, 195px)",
                minWidth: "clamp(160px, 15vw, 195px)",
                maxWidth: "clamp(160px, 15vw, 195px)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: "6px 12px",
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid rgba(229, 231, 235, 0.9)",
                borderRadius: "14px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                transition: "all 180ms ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  draggable={false}
                  style={{
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
