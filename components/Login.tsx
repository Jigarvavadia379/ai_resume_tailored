import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/-js";

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
    <div>
      {/* ... UI as before ... */}
    </div>
  );
}
