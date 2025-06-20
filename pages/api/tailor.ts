import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { tailorResume } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { original, jd } = req.body;

  try {
    const tailored = await tailorResume(original, jd);

    // Save to Supabase (don't assign unused variable 'data')
    const { error } = await supabase
      .from('resumes')
      .insert([{ original_resume: original, job_description: jd, tailored_resume: tailored }]);

    if (error) throw new Error(error.message);

    res.status(200).json({ tailored });
  } catch (error: any) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Failed to tailor resume' });
  }
}
