import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method Not Allowed' });
  }
  const { job_type, original_resume, job_description } = req.body;
  if (!job_type || !original_resume || !job_description) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  const { data, error } = await supabase
    .from('llm_jobs')
    .insert([{ job_type, original_resume, job_description, status: 'pending' }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create job' });
  return res.status(200).json({ jobId: data.id });
}
