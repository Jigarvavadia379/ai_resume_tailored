import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { tailorResume } from '../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { original, jd } = req.body;

  try {
    const tailored = await tailorResume(original, jd);

    await supabase
      .from('resumes')
      .insert([{ original_resume: original, job_description: jd, tailored_resume: tailored }]);

    return res.status(200).json({ tailored });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Tailor API Error:', error.message);
    } else {
      console.error('Tailor API Unknown Error:', error);
    }
    return res.status(500).json({ error: 'Failed to tailor resume' });
  }
}
