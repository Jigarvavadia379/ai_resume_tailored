import { useState } from "react";
import { supabase } from "../lib/supabase";

// Returns { hasQuota, loading, error, checkQuota, decrementQuota }
export function useQuota(userId?: string) {
  const [hasQuota, setHasQuota] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check quota
  const checkQuota = async () => {
    setLoading(true);
    setError(null);
    if (!userId) {
      setError("No user");
      setHasQuota(false);
      setLoading(false);
      return false;
    }
    const { data, error } = await supabase
      .from("user_profiles")
      .select("resumes_left")
      .eq("id", userId)
      .single();
    if (error || !data) {
      setError(error?.message || "No profile found");
      setHasQuota(false);
      setLoading(false);
      return false;
    }
    setHasQuota(data.resumes_left > 0);
    setLoading(false);
    return data.resumes_left > 0;
  };

  // Decrement quota
  const decrementQuota = async () => {
    setLoading(true);
    setError(null);
    if (!userId) {
      setError("No user");
      setLoading(false);
      return false;
    }
    const { data, error } = await supabase
      .from("user_profiles")
      .select("resumes_left")
      .eq("id", userId)
      .single();
    if (error || !data) {
      setError(error?.message || "No profile found");
      setLoading(false);
      return false;
    }
    if (data.resumes_left <= 0) {
      setError("No quota left");
      setLoading(false);
      return false;
    }
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ resumes_left: data.resumes_left - 1 })
      .eq("id", userId);
    if (updateError) setError(updateError.message);
    setLoading(false);
    return !updateError;
  };

  return { hasQuota, loading, error, checkQuota, decrementQuota };
}
