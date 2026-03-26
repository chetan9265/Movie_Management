"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      login(data.user, data.token);
      // Redirect: admin → admin panel, user → movies
      router.push(data.user.role === "admin" ? "/admin" : "/movies");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[var(--accent)] text-3xl font-black tracking-tight">
            CINE<span className="text-white">STREAM</span>
          </span>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 space-y-5">
          <h2 className="text-xl font-bold text-white">Login</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-[var(--text-secondary)]">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[var(--text-secondary)]">Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors">
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-[var(--accent)] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}