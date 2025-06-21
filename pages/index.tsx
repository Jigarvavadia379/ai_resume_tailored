import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [tailored, setTailored] = useState('');
  const [loading, setLoading] = useState(false);

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: { str: string }) => item.str).join(' ') + '\n';
    }

    return text;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const buffer = await file.arrayBuffer();
      const text = await extractTextFromPDF(buffer);
      setResumeText(text);
      console.log('Extracted Resume Text:', text);
    } else if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setResumeText(result.value || '');
    } else if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = () => {
        setResumeText(reader.result?.toString() || '');
      };
      reader.readAsText(file);
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
    const jdWords = jdText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 2);

    const resumeWords = resumeText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);

    const jdSet = new Set<string>(jdWords);
    let matchCount = 0;
    const matched: string[] = [];

    jdSet.forEach((word) => {
      if (resumeWords.includes(word)) {
        matchCount++;
        matched.push(word);
      }
    });

    const score = jdWords.length > 0 ? Math.floor((matchCount / jdSet.size) * 100) : 0;
    setScore(score);
    setMatchedKeywords(matched);
  };

  const handleTailor = async () => {
    setLoading(true);
    const res = await fetch('/api/tailor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original: resumeText, jd: jdText }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error('Tailor error:', error);
      setTailored('Something went wrong while tailoring the resume.');
      setLoading(false);
      return;
    }

    const data = await res.json();
    setTailored(data.tailored || 'Something went wrong');
    setLoading(false);
  };

  return (
    <main className="bg-[#F4F5F7] min-h-screen px-4 py-10 sm:px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">✨ AI Resume Tailor</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">📄 Upload Resume</h2>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer text-center text-sm text-gray-600"
            >
              <input {...getInputProps()} />
              {acceptedFiles.length > 0 ? (
                <p>{acceptedFiles[0].name} uploaded</p>
              ) : (
                <p>Drag & drop or click to upload PDF/DOCX/TXT</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">🔗 Job Description / LinkedIn</h2>
            <textarea
              placeholder="Paste JD or LinkedIn job post here..."
              rows={10}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={jdText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setJdText(e.target.value)}
            />
          </div>
        </div>

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
            <>
              <div className="text-lg font-medium text-blue-600 mb-2">Score: {score}% match</div>
              {matchedKeywords.length > 0 && (
                <div className="text-sm text-gray-600 mb-4">
                  Matched Keywords:{' '}
                  <span className="text-blue-600">{matchedKeywords.join(', ')}</span>
                </div>
              )}
            </>
          )}
          <button
            onClick={handleTailor}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Tailoring...' : '🪄 Tailor My Resume'}
          </button>
        </div>

        {tailored && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">🎯 Tailored Resume</h2>
            <div className="bg-gray-100 p-4 rounded-xl text-sm whitespace-pre-wrap max-h-[400px] overflow-auto font-mono text-gray-800">
              {tailored}
            </div>
          </div>
        )}
      </div>
      {resumeText && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">📝 Extracted Resume Text</h2>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{resumeText}</pre>
        </div>
      )}
    </main>
  );
}
