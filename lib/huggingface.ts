import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_KEY);

export async function suggestEdits(original: string, jd: string): Promise<string> {
  const chatCompletion = await client.chatCompletion({
    provider: "auto",
    model: "mistralai/Mistral-7B-Instruct-v0.3",
    messages: [
      {
        role: "user",
        content: `You are a professional resume writer and ATS optimization expert.
                Suggest bullet points to perfectly match the provided job description.\n\nJob Description:\n${jd}\n\nResume:\n${original}`
      }
    ],
  });

  // Add return statement!
  return chatCompletion.choices?.[0]?.message?.content || "No suggestions returned";
}

export async function tailorResume(original: string, jd: string): Promise<string> {
  const chatCompletion = await client.chatCompletion({
    provider: "auto",
    model: "mistralai/Mistral-7B-Instruct-v0.3",
    messages: [
      {
        role: "user",
        content: `You are a professional resume writer and ATS optimization expert.
                  Rewrite the following resume to perfectly match the provided job description
                  :\n\nJob Description:\n${jd}\n\nResume:\n${original}\n\nOutput:`
      }
    ],
  });

  return chatCompletion.choices?.[0]?.message?.content || "No tailored resume returned";
}
