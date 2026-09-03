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
        {/* Horizontal Hover-Scrollable Track */}
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
            gap: "clamp(28px, 4vw, 56px)",
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: isDragging ? "auto" : "smooth",
            cursor: isDragging ? "grabbing" : "grab",
            padding: "8px 4px",
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
                height: "clamp(80px, 9.5vw, 108px)",
                width: "clamp(145px, 14vw, 195px)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: 0,
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
                  e.currentTarget.style.transform = "scale(1.08)";
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
