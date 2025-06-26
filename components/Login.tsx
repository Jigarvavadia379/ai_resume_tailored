import { useState } from "react";
import Image from 'next/image';
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

type LoginProps = {
  onLogin: (user: User) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (mode === "login") {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.user) {
        setLoading(false); onLogin(data.user); return;
      }
      setError(signInError?.message || "Login failed");
      setLoading(false);
    }
    if (mode === "register") {
      if (password !== confirm) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (data?.user) {
        setLoading(false); onLogin(data.user); return;
      }
      setError(signUpError?.message || "Sign up failed");
      setLoading(false);
    }
    if (mode === "forgot") {
      const { error: forgotError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://ai-resume-tailored.vercel.app/reset-password"
      });

      if (forgotError) setError(forgotError.message);
      else setSuccess("Password reset email sent! Check your inbox.");
      setLoading(false);
    }

  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 bg-white shadow-lg p-8 rounded-xl space-y-6">
      <Image src="/logo.png" alt="Logo" width={80} height={80} />
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        {mode === "login" ? "Login" : mode === "register" ? "Register" : "Forgot Password"}
      </h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="Email"
        autoFocus
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      {(mode === "login" || mode === "register") && (
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      )}
      {mode === "register" && (
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="Confirm Password"
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Login"
          : mode === "register"
          ? "Register"
          : "Send Reset Link"}
      </button>
      <div className="flex justify-between mt-2 text-xs">
        {mode !== "login" && (
          <button type="button" className="underline" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
            Back to Login
          </button>
        )}
        {mode === "login" && (
          <>
            <button type="button" className="underline" onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
              Create account
            </button>
            <button type="button" className="underline" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>
              Forgot Password?
            </button>
          </>
        )}
      </div>
      {error && <div className="text-red-700 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-100 p-2 rounded">{success}</div>}
    </form>
  );
}
