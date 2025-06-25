import { useState } from 'react';
import jsPDF from "jspdf";
import type { TextItem } from 'pdfjs-dist/types/src/display/api';



export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [originalResumeText, setOriginalResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [tailored, setTailored] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true); // new state
  const [progress, setProgress] = useState(0); // Progress from 0 to 100
  const [editMode, setEditMode] = useState(false); // new state


const pollJobStatus = async (
  jobId: string,
  onResult: (result: string) => void,
  onError: (msg: string) => void
) => {
  let attempts = 0;
  const maxAttempts = 30; // (24 x 2s = 120s)
  setProgress(0);

  const poll = async () => {
    attempts++;
    setProgress(Math.min(100, Math.floor((attempts / maxAttempts) * 100)));
    try {
      const res = await fetch(`/api/job-status?jobId=${jobId}`);
      if (!res.ok) throw new Error("Failed to check job status");
      const data = await res.json();
      if (data.status === "complete") {
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
        onResult(data.result || 'No output');
      } else if (data.status === "error") {
        setProgress(0);
        onError(data.error_message || "Job failed.");
      } else if (attempts < maxAttempts) {
        setTimeout(poll, 2000);
      } else {
        setProgress(0);
        onError("Timed out waiting for job result.");
      }
    } catch  {
      setProgress(0);
    }
  };
  poll();
};

  const loadPDFJS = () => {
    return new Promise<typeof import('pdfjs-dist')>((resolve, reject) => {
      const windowWithPDFJS = window as typeof window & {
        pdfjsLib?: typeof import('pdfjs-dist');
      };
      if (windowWithPDFJS.pdfjsLib) {
        resolve(windowWithPDFJS.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (windowWithPDFJS.pdfjsLib) {
          windowWithPDFJS.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(windowWithPDFJS.pdfjsLib);
        } else {
          reject(new Error('PDF.js failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js script'));
      document.head.appendChild(script);
    });
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    try {
      setUploadStatus('Loading PDF processor...');
      const pdfjsLib = await loadPDFJS();
      setUploadStatus('Processing PDF...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as TextItem[]).map((item) => item.str).join(' ');
        text += pageText + '\n';
      }
      setUploadStatus('PDF processed successfully!');
      return text.trim();
    } catch {
      console.error('PDF extraction failed:');
      setUploadStatus('Failed to process PDF. Please try converting to TXT format.');
    }
  };

  const extractTextFromDOCX = async (arrayBuffer: ArrayBuffer) => {
    try {
      setUploadStatus('Processing DOCX...');
      console.log('DOCX file size:', arrayBuffer.byteLength); // prevents unused var error
      setUploadStatus('DOCX processing not available in this environment. Please convert to PDF or TXT.');
      throw new Error('DOCX processing not available');
    } catch {
      setUploadStatus('Failed to process DOCX. Please convert to PDF or TXT.');
    }
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'pdf') {
        const buffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(buffer);
        setResumeText(text || '');
        setOriginalResumeText(text || '');
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        await extractTextFromDOCX(arrayBuffer);
      } else if (ext === 'txt') {
        const text = await file.text();
        setResumeText(text || '');
        setOriginalResumeText(text || '');
        setUploadStatus('TXT file uploaded successfully!');
      } else {
        setUploadStatus("Unsupported file type. Please upload a PDF or TXT file.");
      }
    } catch {
      console.error('File processing error:');
    }
  };

  const handleScore = () => {
    if (!resumeText?.trim() || !jdText?.trim()) {
      setUploadStatus('Please upload a resume and paste the job description.');
      return;
    }
    const jdWords = jdText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);
    const resumeWords = resumeText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);
    const matched: string[] = [];
    let matchCount = 0;
    jdWords.forEach((word) => {
      if (resumeWords.includes(word)) {
        matchCount++;
        if (!matched.includes(word)) {
          matched.push(word);
        }
      }
    });
    const calculatedScore = jdWords.length > 0 ? Math.floor((matchCount / jdWords.length) * 100) : 0;
    setScore(calculatedScore);
    setMatchedKeywords(matched);
  };

  const handleSuggest = async () => {
    if (!resumeText?.trim() || !jdText?.trim()) {
      setUploadStatus('Please upload a resume and paste the job description.');
      return;
    }
    setLoading(true);
    setSuggestions('');
    const sourceText = originalResumeText || resumeText;
    try {
      const res = await fetch('/api/start-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_type: "suggest",
          original_resume: sourceText,
          job_description: jdText
        }),
      });
      if (!res.ok) {
        setSuggestions('Could not create job.');
        setLoading(false); setProgress(0);

        return;
      }
      const { jobId } = await res.json();
      pollJobStatus(jobId,
        (result) => { setSuggestions(result); setLoading(false); setProgress(0);
 },
        (msg) => { setSuggestions(msg); setLoading(false); setProgress(0);
 }
      );
    } catch {
      setSuggestions('Error submitting job');
      setLoading(false); setProgress(0);

    }
  };


  const handleTailor = async () => {
    if (!resumeText?.trim() || !jdText?.trim()) {
      setUploadStatus('Please upload a resume and paste the job description.');
      return;
    }
    setLoading(true);
    setTailored('');
    const sourceText = originalResumeText || resumeText;
    try {
      const res = await fetch('/api/start-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_type: "tailor",
          original_resume: sourceText,
          job_description: jdText
        }),
      });
      if (!res.ok) {
        setTailored('Could not create job.');
        setLoading(false); setProgress(0);

        return;
      }
      const { jobId } = await res.json();
      pollJobStatus(jobId,
        (result) => {
          setTailored(result);
          setResumeText(result);
          const blob = new Blob([result], { type: 'text/plain' });
          setDownloadUrl(URL.createObjectURL(blob));
          setLoading(false); setProgress(0);

        },
        (msg) => { setTailored(msg); setLoading(false); setProgress(0);
 }
      );
    } catch  {
      setTailored('Error submitting job');
      setLoading(false); setProgress(0);

    }
  };


  const handleDownload = () => {
    if (!tailored) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont('helvetica', 'normal'); // or 'times', 'courier'
    doc.setFontSize(12);
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeight = 16;
    let y = margin;
    const lines = doc.splitTextToSize(tailored, doc.internal.pageSize.getWidth() - 2 * margin);
    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });
    doc.save('tailored-resume.pdf');
  };


  return (
    <main className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen px-4 py-10 sm:px-6 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✨ AI Resume Tailor</h1>
          <p className="text-gray-600">Upload your resume and tailor it to any job description</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">📄 Upload Resume</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="text-3xl">📎</div>
                <p className="text-sm text-gray-600">
                  Click to upload PDF, DOCX, or TXT file
                </p>
              </label>
            </div>
            {uploadStatus && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                uploadStatus.includes('Error') || uploadStatus.includes('Failed')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {uploadStatus}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">🔗 Job Description</h2>
            <textarea
              placeholder="Paste the job description or LinkedIn job post here..."
              rows={12}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleScore}
                className="bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-900 transition-all transform hover:scale-105"
              >
                🔍 Check & Score Resume
              </button>
              <button
                onClick={handleSuggest}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? '🔄 Working...' : '💡 Suggest Edits'}
              </button>
              <button
                onClick={handleTailor}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? '🔄 Tailoring...' : '🪄 Tailor My Resume'}
              </button>
            </div>
            {score !== null && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  Match Score: {score}%
                </div>
                {matchedKeywords.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Matched Keywords: </span>
                    <span className="text-blue-600 font-medium">
                      {matchedKeywords.slice(0, 10).join(', ')}
                      {matchedKeywords.length > 10 && ` and ${matchedKeywords.length - 10} more...`}
                    </span>
                  </div>
                )}
              </div>
            )}
                {loading && (
                  <div className="w-full flex flex-col items-center my-4">
                    <div className="w-2/3 h-3 bg-blue-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-blue-700 text-sm font-medium">
                      AI is working... {progress}% done
                    </div>
                  </div>
                )}
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-left">
              <button
                className="mb-2 text-green-800 font-semibold underline"
                onClick={() => setShowSuggestions(s => !s)}
              >
                {showSuggestions ? "Hide Suggestions" : "Show Suggestions"}
              </button>
              {showSuggestions && (
                <>
                  <h3 className="font-semibold text-green-800 mb-2">💡 Suggestions for Improvement:</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{suggestions}</div>
                </>
              )}
            </div>
          </div>
        </div>
        {tailored && (
           <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold text-gray-700">🎯 Tailored Resume</h2>
               <button
                 className="px-4 py-1 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200"
                 onClick={() => setEditMode(e => !e)}
               >
                 {editMode ? "Save" : "Edit"}
               </button>
             </div>
             {editMode ? (
                   <textarea
                     value={tailored}
                     onChange={e => setTailored(e.target.value)}
                     className="bg-gray-50 p-4 rounded-xl text-sm whitespace-pre-wrap max-h-[400px] overflow-auto font-mono text-gray-800 border w-full min-h-[300px]"
                   />
                 ) : (
                   <div className="bg-gray-50 p-4 rounded-xl text-sm whitespace-pre-wrap max-h-[400px] overflow-auto font-mono text-gray-800 border">
                     {tailored}
                   </div>
                 )}
            {downloadUrl && (
                  <div className="text-center mt-4">
                    <button
                      onClick={handleDownload}
                      className="bg-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-purple-700 transition-all transform hover:scale-105"
                    >
                      ⬇️ Download Tailored Resume
                    </button>
                  </div>
                )}
          </div>
      </div>
    </main>
  );
}
