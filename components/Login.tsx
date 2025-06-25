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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Try sign-in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email, password,
    });

    if (signInData?.user) {
      setLoading(false);
      onLogin(signInData.user);
      return;
    }

    if (signInError?.message?.toLowerCase().includes("invalid login credentials")) {
      // Try sign-up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
      });
      if (signUpData?.user) {
        setLoading(false);
        onLogin(signUpData.user);
        return;
      }
      setError(signUpError?.message || "Sign up failed");
      setLoading(false);
      return;
    }

    setError(signInError?.message || "Login failed");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-12 bg-white shadow-lg p-8 rounded-xl space-y-5">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Login / Register</h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="Email"
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        placeholder="Password"
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
      >
        {loading ? "Please wait..." : "Login / Register"}
      </button>
      {error && <div className="text-red-700 bg-red-100 p-2 rounded">{error}</div>}
    </form>
  );
}
