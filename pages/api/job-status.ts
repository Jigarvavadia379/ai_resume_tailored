import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobId } = req.query;
  if (!jobId) return res.status(400).json({ error: 'Missing jobId' });

  const { data, error } = await supabase
    .from('llm_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) return res.status(404).json({ error: 'Job not found' });
  return res.status(200).json({
    status: data.status,
    result: data.result,
    error_message: data.error_message,
  });
}
