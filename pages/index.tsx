import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function Home() {
  const [original, setOriginal] = useState('');
  const [jd, setJD] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original, jd }),
    });
    const data = await res.json();
    setResult(data.tailored || 'Something went wrong');
    setLoading(false);
  };

  const handleDownload = () => {
    if (!resultRef.current) return;

    const opt = {
      margin:       0.5,
      filename:     'tailored-resume.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(resultRef.current).save();
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-4 py-10 sm:px-6 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">🎯 AI Resume Tailor</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Your Resume</label>
              <textarea
                className="w-full h-64 rounded-xl border border-gray-300 p-4 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Paste your current resume here..."
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Job Description</label>
              <textarea
                className="w-full h-64 rounded-xl border border-gray-300 p-4 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Paste job description here..."
                value={jd}
                onChange={(e) => setJD(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50"
            >
              {loading ? 'Tailoring...' : 'Tailor My Resume'}
            </button>

            {result && (
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-900 transition shadow"
              >
                📄 Download PDF
              </button>
            )}
          </div>

          {result && (
            <div className="mt-10">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Your Tailored Resume</h2>
              <div
                ref={resultRef}
                className="bg-gray-50 rounded-xl p-6 text-sm whitespace-pre-wrap text-gray-800 font-mono max-h-[500px] overflow-auto shadow-inner"
              >
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
