"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        window.location.href = "/admin";
        return;
      }
      setError(data.error || "Login failed. Please try again.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <div className="login__brand">
          Field <b>Study</b>
        </div>
        <div className="login__kicker">Admin access</div>

        <label className="login__label">
          Username
          <input
            className="login__input"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="login__label">
          Password
          <input
            className="login__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className="login__error" role="alert">
            {error}
          </div>
        )}

        <button className="login__btn" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
