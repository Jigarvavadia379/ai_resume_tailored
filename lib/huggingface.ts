const HF_API_KEY = process.env.HF_API_KEY!;
const HF_ENDPOINT = 'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528';

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
  const result = output.replace(prompt, '').trim();
  return result;
}

export async function tailorResume(original: string, jd: string): Promise<string> {
  const prompt = `You are a professional resume writer and ATS optimization expert.
                  Rewrite the following resume to perfectly match the provided job description, making sure each experience section includes specific, relevant, and quantifiable bullet points.

                  Focus on:
                  - Incorporating important keywords and skills from the job description
                  - Highlighting relevant achievements and responsibilities for each job role
                  - Using action verbs and professional language
                  - Ensuring the resume is ATS-friendly and easy to read

                  Format the output in clear resume sections: Summary, Experience (with bullet points for each position), Skills, and Education.
                  Add or improve bullet points in each Experience section as needed, based on the job description.
                  Do not include information not present in the resume, but rephrase and enhance for greater impact.
                  .\n\nJob description to match:\n${jd}\n\nResume to rewrite:\n${original}\n\nReturn only the tailored resume.`;
  return queryHuggingFace(prompt);
}

export async function suggestEdits(original: string, jd: string): Promise<string> {
  const prompt = `You are an expert resume writer and career coach specializing in Applicant Tracking System (ATS) optimization.

                  Compare the following resume and job description.
                  Your task is to suggest specific improvements, edits, and new bullet points that can be added or modified in each relevant job experience to make the resume more closely match the requirements, keywords, and skills in the job description.

                  For each Experience section of the resume:
                  - List the current bullet points.
                  - Suggest changes or new bullet points (use clear, professional language and quantify achievements where possible).
                  - Clearly explain which job description requirements or keywords are being addressed with each suggestion.

                  Output the suggestions as a structured list, organized by resume section/job title.

                  Do not rewrite the whole resume. Only provide targeted suggestions and new bullet points, along with brief reasoning for each.
                  .\n\nHere is the job description:\n${jd}\n\nHere is the resume:\n${original}\n\nOutput:`;
  return queryHuggingFace(prompt);
}
