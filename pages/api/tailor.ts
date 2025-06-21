import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { tailorResume } from '../../lib/huggingface';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method Not Allowed' });
  }

  const { original, jd } = req.body;

  if (!original || !jd) {
    return res.status(400).json({ error: 'Missing resume or job description' });
  }

  try {
    const tailored = await tailorResume(original, jd);

    await supabase
      .from('resumes')
      .insert([{ original_resume: original, job_description: jd, tailored_resume: tailored }]);

    return res.status(200).json({ tailored });
  } catch (error) {
    console.error('Tailor API Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'Failed to tailor resume' });
  }
}
