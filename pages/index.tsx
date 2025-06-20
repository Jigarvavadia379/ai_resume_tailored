import { useState } from 'react';

export default function Home() {
  const [original, setOriginal] = useState('');
  const [jd, setJD] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>🎯 AI Resume Tailor</h1>
      <textarea
        placeholder="Paste your original resume"
        rows={10}
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
        style={{ width: '100%', marginBottom: 12 }}
      />
      <textarea
        placeholder="Paste the job description"
        rows={6}
        value={jd}
        onChange={(e) => setJD(e.target.value)}
        style={{ width: '100%', marginBottom: 12 }}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Tailoring...' : 'Tailor Resume'}
      </button>
      {result && (
        <>
          <h2>✨ Tailored Resume</h2>
          <pre style={{ background: '#eee', padding: 10 }}>{result}</pre>
        </>
      )}
    </main>
  );
}
