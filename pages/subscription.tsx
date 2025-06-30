import { useState } from "react";

const PLANS = [
  {
    name: "Starter",
    resumes: 10,
    price: 2,
    id: "plan_10", // For Stripe product/price id mapping
  },
  {
    name: "Pro",
    resumes: 20,
    price: 3,
    id: "plan_20",
  },
  {
    name: "Elite",
    resumes: 50,
    price: 5,
    id: "plan_50",
  },
];

export default function Subscription() {
  const [selected, setSelected] = useState(PLANS[0].id);
  const [loading, setLoading] = useState(false);

  // Placeholder: Connect this to Stripe checkout API
  const handleSubscribe = async () => {
    setLoading(true);
    // TODO: Redirect to Stripe Checkout or your backend API
    alert(`Subscribing to plan: ${selected}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Choose Your Plan</h1>
        <div className="space-y-4 mb-8">
          {PLANS.map((plan) => (
            <label key={plan.id} className={`block border rounded-lg px-4 py-4 cursor-pointer transition
              ${selected === plan.id ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50' : 'border-gray-200'}
            `}>
              <input
                type="radio"
                className="sr-only"
                name="plan"
                value={plan.id}
                checked={selected === plan.id}
                onChange={() => setSelected(plan.id)}
              />
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{plan.name} Plan</div>
                  <div className="text-gray-600">{plan.resumes} tailored resumes/month</div>
                </div>
                <div className="text-indigo-700 text-xl font-bold mt-2 sm:mt-0">
                  ${plan.price} <span className="text-sm font-normal">/mo</span>
                </div>
              </div>
            </label>
          ))}
        </div>
        <button
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Subscribe"}
        </button>
        <div className="text-xs text-center text-gray-400 mt-3">
          All plans auto-renew monthly. Cancel anytime.
        </div>
      </div>
    </div>
  );
}
