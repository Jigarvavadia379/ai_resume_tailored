import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { suggestEdits, tailorResume } from '../../lib/huggingface';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: jobs, error } = await supabase
    .from('llm_jobs')
    .select('*')
    .eq('status', 'pending');

  if (error) return res.status(500).json({ error: 'Failed to fetch jobs' });

  let processed = 0;
  for (const job of jobs) {
    try {
      let result = '';
      if (job.job_type === 'suggest') {
        result = await suggestEdits(job.original_resume, job.job_description);
      } else if (job.job_type === 'tailor') {
        result = await tailorResume(job.original_resume, job.job_description);
      } else {
        throw new Error('Unknown job_type');
      }

      await supabase
        .from('llm_jobs')
        .update({
          result,
          status: 'complete',
          updated_at: new Date(),
          error_message: null,
        })
        .eq('id', job.id);
      processed++;
    } catch (err) {
      await supabase
        .from('llm_jobs')
        .update({
          status: 'error',
          error_message: err instanceof Error ? err.message : String(err),
          updated_at: new Date(),
        })
        .eq('id', job.id);
    }
  }
  return res.status(200).json({ processed });
}
