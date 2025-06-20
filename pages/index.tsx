import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [tailored, setTailored] = useState('');
  const [loading, setLoading] = useState(false);


  const onDrop = async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'pdf') {
        const buffer = await file.arrayBuffer();
        const data = await pdfParse(buffer);
        setResumeText(data.text || '');
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setResumeText(result.value || '');
      } else {
          alert("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      }
    };

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    onDrop,
  });



  const handleScore = () => {
    // Dummy score logic (real scoring to come later)
    const jdWords = jdText.split(/\s+/).filter(Boolean);
    const resumeWords = resumeText.split(/\s+/).filter(Boolean);
    const match = jdWords.filter((word) => resumeWords.includes(word)).length;
    const score = Math.min(100, Math.floor((match / jdWords.length) * 100));
    setScore(score);
  };

  const handleTailor = async () => {
    setLoading(true);
    const res = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original: resumeText, jd: jdText }),
    });
    const data = await res.json();
    setTailored(data.tailored || 'Something went wrong');
    setLoading(false);
  };

  return (
    <main className="bg-[#F4F5F7] min-h-screen px-4 py-10 sm:px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">✨ AI Resume Tailor</h1>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume Upload Card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">📄 Upload Resume</h2>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer text-center text-sm text-gray-600">
              <input {...getInputProps()} />
              {acceptedFiles.length > 0 ? (
                <p>{acceptedFiles[0].name} uploaded</p>
              ) : (
                <p>Drag & drop or click to upload PDF/DOCX</p>
              )}
            </div>
          </div>

          {/* Job Description / LinkedIn Input */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">🔗 Job Description / LinkedIn</h2>
            <textarea
              placeholder="Paste JD or LinkedIn job post here..."
              rows={10}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
        </div>

        {/* Score & Tailor */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <div className="mb-4">
            <button
              onClick={handleScore}
              className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-900 transition"
            >
              🔍 Check & Score Resume
            </button>
          </div>
          {score !== null && (
            <div className="text-lg font-medium text-blue-600 mb-4">Score: {score}% match</div>
          )}
          <button
            onClick={handleTailor}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Tailoring...' : '🪄 Tailor My Resume'}
          </button>
        </div>

        {/* Output */}
        {tailored && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">🎯 Tailored Resume</h2>
            <div className="bg-gray-100 p-4 rounded-xl text-sm whitespace-pre-wrap max-h-[400px] overflow-auto font-mono text-gray-800">
              {tailored}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
