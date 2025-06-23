import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function suggestEdits(original: string, jd: string): Promise<string> {
  const chatCompletion = await client.chatCompletion({
    provider: "novita",
    model: "deepseek-ai/DeepSeek-R1-0528",
    messages: [
      {
        role: "user",
        content: `You are a professional resume writer and ATS optimization expert.
                                    Suggest the following resume to perfectly match the provided job description, making sure each experience section includes specific, relevant, and quantifiable bullet points.

                                    Focus on:
                                    - Incorporating important keywords and skills from the job description
                                    - Highlighting relevant achievements and responsibilities for each job role
                                    - Using action verbs and professional language
                                    - Ensuring the resume is ATS-friendly and easy to read

                                    Suggest bullet points in each Experience section as needed, based on the job description.
                                    Suggest information not present in the resume, and also rephrase and enhance for greater impact.\n\nJob Description:\n${jd}\n\nResume:\n${original}`
      }
    ],
  });

export async function tailorResume(original: string, jd: string): Promise<string> {
  const chatCompletion = await client.chatCompletion({
    provider: "novita",
    model: "deepseek-ai/DeepSeek-R1-0528",
    messages: [
      {
        role: "user",
        content: `You are a professional resume writer and ATS optimization expert.
                                                      Rewrite the following resume to perfectly match the provided job description, making sure each experience section includes specific, relevant, and quantifiable bullet points.

                                                      Focus on:
                                                      - Incorporating important keywords and skills from the job description
                                                      - Highlighting relevant achievements and responsibilities for each job role
                                                      - Using action verbs and professional language
                                                      - Ensuring the resume is ATS-friendly and easy to read

                                                      Format the output in clear resume sections: Summary, Experience (with bullet points for each position), Skills, and Education.
                                                      Add or improve bullet points in each Experience section as needed, based on the job description.
                                                      Do not include information not present in the resume, but rephrase and enhance for greater impact:\n\nJob Description:\n${jd}\n\nResume:\n${original}\n\nOutput:`
      }
    ],
  });

  return chatCompletion.choices?.[0]?.message?.content || "No tailored resume returned";
}