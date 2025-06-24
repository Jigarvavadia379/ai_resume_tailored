import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_KEY);

export async function suggestEdits(original: string, jd: string): Promise<string> {
  const chatCompletion = await client.chatCompletion({
    provider: "auto",
    model: "akjindal53244/Llama-3.1-Storm-8B",
    messages: [
      {
        role: "user",
        content: `System: You are an expert resume assistant who helps job seekers improve their resumes for specific job descriptions. Given a job description and a candidate's resume, you analyze both and suggest concrete improvements.

                  Here is the job description:
                  \n${jd}\n

                  Here is the resume:
                  \n${original}

                  Task: Compare the job description and the resume.
                  List 10 specific, actionable suggestions that will help make this resume a much better fit for the job.
                  Each suggestion should be focused, clear, and based on a gap, missing skill, or improvement area you see.
                  Start each suggestion with a bullet point.`
      }
    ],
  });

  // Add return statement!
  return chatCompletion.choices?.[0]?.message?.content || "No suggestions returned";
}

export async function tailorResume(original: string, jd: string): Promise<string> {
  const chatCompletion = await client.chatCompletion({
    provider: "auto",
    model: "akjindal53244/Llama-3.1-Storm-8B",
    messages: [
      {
        role: "user",
        content: `You are an expert resume assistant. Your job is to take a candidate’s resume and a job description, compare them, and rewrite the resume to better fit the job. Make sure to:
                  - Highlight relevant skills and experience.
                  - Use language and keywords from the job description where applicable.
                  - Quantify achievements where possible.
                  - DO NOT invent or exaggerate experience not present in the original resume.

                  Here is the job description:
                  \n${jd}\n

                  Here is the resume:
                  \n${original}

                  Task: Carefully tailor the resume to this job description.
                  Rewrite the resume bullets, summary, and skills section as needed, focusing on matching the job requirements
                  and preferred qualifications.
                  Only include experience and skills that are already present in the resume,
                  but emphasize those that align with the JD.
                  The output should be a fully tailored resume in professional language, ready to use for this job application.

                  :\n\nJob Description:\n${jd}\n\nResume:\n${original}\n\nOutput:`
      }
    ],
  });

  return chatCompletion.choices?.[0]?.message?.content || "No tailored resume returned";
}
