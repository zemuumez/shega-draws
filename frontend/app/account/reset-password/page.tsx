"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      className="management-page"
      onSubmit={async (e) => {
        e.preventDefault();
        const token =
          new URLSearchParams(window.location.search).get("token") || "";
        const r = await authClient.resetPassword({
          newPassword: password,
          token,
        });
        setMessage(r.error?.message || "Password reset. You can now sign in.");
      }}
    >
      <h1>Reset password</h1>
      <input
        required
        type="password"
        minLength={12}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="New password"
      />
      <button>Save password</button>
      <p role="status">{message}</p>
      <a href="/account">Sign in</a>
    </form>
  );
}
