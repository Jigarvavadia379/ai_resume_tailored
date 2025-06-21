import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  });

  return completion.choices[0].message.content || '';
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

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  });

  return completion.choices[0].message.content || '';
}
