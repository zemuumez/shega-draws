"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { clearAccountToken } from "@/lib/account-api";

interface TelegramAuthProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function TelegramAuth({ onSuccess, onError }: TelegramAuthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "ZemuAdminBot";
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    // Define global callback expected by Telegram widget
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/telegram/verify-and-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Telegram authentication failed.");
        }

        clearAccountToken();
        onSuccess();
      } catch (err: any) {
        onError(err.message || "Failed to authenticate with Telegram.");
      } finally {
        setLoading(false);
      }
    };

    // If bot name is configured, embed official Telegram Login Widget
    if (botName && containerRef.current) {
      containerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", botName);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "10");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-userpic", "true");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.async = true;
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botName, onSuccess, onError]);

  // Dev mode simulator when bot is not yet created in BotFather
  async function handleDemoLogin() {
    setLoading(true);
    setDemoActive(true);
    try {
      const demoUser = {
        id: 789456123,
        first_name: "Dawit",
        last_name: "Kebede",
        username: "dawit_rimna",
        photo_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Dawit",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "dev-simulated-hash",
      };

      const res = await fetch("/api/auth/telegram/verify-and-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoUser),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Telegram demo login failed.");
      }

      clearAccountToken();
      onSuccess();
    } catch (err: any) {
      onError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="telegram-auth-box">
      <div className="telegram-icon-badge">
        <Send size={24} color="#0088cc" />
      </div>

      <h3>Sign In with Telegram</h3>
      <p>
        Instant passwordless authentication with zero SMS fees. Verified through your Telegram
        account.
      </p>

      {/* Official widget container */}
      {botName ? (
        <div className="telegram-widget-wrapper" ref={containerRef}>
          {loading && (
            <div className="telegram-loading">
              <Loader2 size={20} className="animate-spin" />
              <span>Verifying authorization…</span>
            </div>
          )}
        </div>
      ) : (
        <div className="telegram-notice-box">
          <p className="telegram-notice-text">
            <span>⚙️ <strong>Bot Configuration Pending:</strong></span>
            Set <code>NEXT_PUBLIC_TELEGRAM_BOT_NAME</code> & <code>TELEGRAM_BOT_TOKEN</code> in your <code>.env.local</code> to activate the live widget.
          </p>
        </div>
      )}

      {/* Development Quick-Test Simulator */}
      {isDev && (
        <div style={{ marginTop: "16px", width: "100%" }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="telegram-demo-btn"
          >
            {loading && demoActive ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authorizing simulated user…</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Test with Simulated Telegram Profile (Dev Mode)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
