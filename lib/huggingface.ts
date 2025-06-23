const HF_API_KEY = process.env.HF_API_KEY!;
const HF_ENDPOINT = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

async function queryHuggingFace(prompt: string): Promise<string> {
  const res = await fetch(HF_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HF API error ${res.status}: ${msg}`);
  }

  const data = await res.json();
  const output = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
  if (typeof output !== 'string') {
    return JSON.stringify(data);
  }
  return output;
}

export async function tailorResume(original: string, jd: string): Promise<string> {
  const prompt = `You are an expert resume writer. Rewrite the resume to match this job description. Optimize it for ATS keywords, structure, and tone.\n\nJob Description:\n${jd}\n\nResume:\n${original}\n\nOutput:`;
  return queryHuggingFace(prompt);
}

export async function suggestEdits(original: string, jd: string): Promise<string> {
  const prompt = `You are an expert resume reviewer. Provide bullet point suggestions for improving the resume to better match the following job description.\n\nJob Description:\n${jd}\n\nResume:\n${original}\n\nOutput:`;
  return queryHuggingFace(prompt);
}
