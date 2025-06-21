const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct";
const HF_API_KEY = process.env.HF_API_KEY!;

async function callHuggingFace(prompt: string): Promise<string> {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const data = await response.json();

  if (data.error) throw new Error(data.error);

  // Return generated text if available
  return data[0]?.generated_text || "No response";
}

export async function tailorResume(original: string, jd: string): Promise<string> {
  const prompt = `
You are an expert resume writer.
Rewrite the resume to match this job description.
Optimize it for ATS keywords, structure, and tone.

Job Description:
${jd}

Resume:
${original}

Output:
`;
  return await callHuggingFace(prompt);
}

export async function suggestEdits(original: string, jd: string): Promise<string> {
  const prompt = `
You are an expert resume reviewer.
Provide bullet point suggestions for improving the resume to better match the following job description.

Job Description:
${jd}

Resume:
${original}

Output:
`;
  return await callHuggingFace(prompt);
}
