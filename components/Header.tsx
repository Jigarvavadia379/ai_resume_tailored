import Image from 'next/image';
import Link from 'next/link';
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const languages = [
  { code: "en", label: "🇺🇸 English" },
  { code: "de", label: "🇩🇪 German" },
  { code: "fr", label: "🇫🇷 French" },
  { code: "it", label: "🇮🇹 Italian" },
  { code: "pt", label: "🇵🇹 Portuguese" },
  { code: "hi", label: "🇮🇳 Hindi" },
  { code: "es", label: "🇪🇸 Spanish" },
  { code: "th", label: "🇹🇭 Thai" },
];

export default function Header({ handleLogout }: { handleLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };


  return (
    <header className="flex items-center justify-between py-3 px-6 bg-white shadow rounded-xl max-w-4xl mx-auto mt-6 mb-4">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded" />
        <span className="font-bold text-lg text-gray-800">Your SaaS</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <select
          value={language}
          onChange={e => changeLanguage(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
        {/* Subscription Tab */}
        <Link href="/subscription" className="bg-indigo-50 text-indigo-700 rounded px-3 py-1 text-sm font-medium hover:bg-indigo-100 border border-indigo-200">
          {t('subscription')}
        </Link>
        {/* Logout Button */}
        <button
          className="text-blue-600 hover:underline text-sm font-medium"
          onClick={handleLogout}
        >
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
