import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Supabase sets session automatically on hash, but we can ensure it's loaded
    const checkSession = async () => {
      // Wait a tick for Supabase to process the URL hash
      setTimeout(async () => {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          setMessage("Auth session missing! Please use the reset link sent to your email.");
        }
        setSessionChecked(true);
      }, 300);
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset! You can now log in.");
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleReset} className="bg-white p-8 rounded shadow-lg max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        {!sessionChecked ? (
          <p>Checking your reset link…</p>
        ) : (
          <>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
              disabled={!sessionChecked}
            >
              Set New Password
            </button>
            {message && (
              <div className={`text-center p-2 rounded ${message.startsWith("Password reset") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message}
              </div>
            )}
          </>
        )}
      </form>
    </main>
  );
}
