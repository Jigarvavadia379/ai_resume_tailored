// components/Login.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

type LoginProps = {
  onLogin: (user: User) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (mode === "login") {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInData?.user) {
        setLoading(false); onLogin(signInData.user); return;
      }
      if (signInError?.message?.toLowerCase().includes("invalid login credentials")) {
        // Try sign up (auto-registration for new users)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpData?.user) {
          setLoading(false); onLogin(signUpData.user); return;
        }
        setError(signUpError?.message || "Sign up failed");
        setLoading(false);
        return;
      }
      setError(signInError?.message || "Login failed");
      setLoading(false);
    } else if (mode === "forgot") {
      const { error: forgotError } = await supabase.auth.resetPasswordForEmail(email);
      if (forgotError) setError(forgotError.message);
      else setSuccess("Password reset email sent! Check your inbox.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 bg-white shadow-lg p-8 rounded-xl space-y-6">
      <div className="flex flex-col items-center mb-3">
        <img src="/logo.svg" alt="Logo" className="w-14 h-14 mb-2" />
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Your SaaS</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in or Register to get started</p>
      </div>

      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="Email"
        autoFocus
        autoComplete="email"
        className="w-full p-3 border border-gray-300 rounded-lg"
      />

      {mode === "login" && (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Password"
            autoComplete="current-password"
            className="w-full p-3 border border-gray-300 rounded-lg pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      )}

      {mode === "login" ? (
        <>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            {loading ? "Please wait..." : "Login / Register"}
          </button>
          <div className="flex justify-between mt-2">
            <button
              type="button"
              className="text-blue-600 underline text-xs"
              onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
            >
              Forgot Password?
            </button>
            {/* Placeholders for terms/privacy */}
            <div className="text-gray-400 text-xs">
              <a href="/terms" className="underline mr-2">Terms</a>
              <a href="/privacy" className="underline">Privacy</a>
            </div>
          </div>
        </>
      ) : (
        <>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            {loading ? "Please wait..." : "Send Reset Link"}
          </button>
          <button
            type="button"
            className="w-full text-gray-600 underline text-xs mt-1"
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
          >
            Back to Login
          </button>
        </>
      )}

      {error && <div className="text-red-700 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-100 p-2 rounded">{success}</div>}
    </form>
  );
}
