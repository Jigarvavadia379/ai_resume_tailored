import { useState } from "react";
import { supabase } from "../lib/supabase";

type LoginProps = {
  onLogin: (user: any) => void;
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

    // If login failed due to user not found, try sign-up
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold w-full hover:bg-blue-700 transition-all"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login / Register"}
        </button>
      </form>
    </div>
  );
}
