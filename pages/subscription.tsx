import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const PLANS = [
  { label: "10 resumes / month", value: "10", resumes: 10 },
  { label: "20 resumes / month", value: "20", resumes: 20 },
  { label: "50 resumes / month", value: "50", resumes: 50 },
];

export default function Subscription() {
  const [selected, setSelected] = useState(PLANS[0].value);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const user = supabase.auth.user();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("user_profiles")
        .select("resumes_left, subscription_plan")
        .eq("id", user.id)
        .single();
      if (data && data.subscription_plan !== "none" && data.resumes_left > 0) {
        router.replace("/"); // Already subscribed, go home
      }
    };
    check();
  }, [router]);

  const handleFakeSubscribe = async () => {
    setLoading(true);
    const user = supabase.auth.user();
    const selectedPlan = PLANS.find((plan) => plan.value === selected);
    if (!user || !selectedPlan) return;
    await supabase
      .from("user_profiles")
      .update({
        subscription_plan: selectedPlan.value,
        resumes_left: selectedPlan.resumes,
      })
      .eq("id", user.id);
    setLoading(false);
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Choose a Plan (Testing)</h1>
        <div className="space-y-4 mb-8">
          {PLANS.map((plan) => (
            <label key={plan.value} className={`block border rounded-lg px-4 py-4 cursor-pointer transition
              ${selected === plan.value ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}
            `}>
              <input
                type="radio"
                className="sr-only"
                name="plan"
                value={plan.value}
                checked={selected === plan.value}
                onChange={() => setSelected(plan.value)}
              />
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{plan.label}</div>
                <div className="text-indigo-700 text-xl font-bold">${plan.resumes / 10 * 2}</div>
              </div>
            </label>
          ))}
        </div>
        <button
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={handleFakeSubscribe}
          disabled={loading}
        >
          {loading ? "Updating..." : "Fake Subscribe"}
        </button>
        <div className="text-xs text-center text-gray-400 mt-3">
          This is a test subscription (no payment). Stripe coming soon!
        </div>
      </div>
    </div>
  );
}
