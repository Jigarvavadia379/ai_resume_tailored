import { supabase } from '../../lib/supabase';
import { suggestEdits } from '../../lib/huggingface';

export default async function handler(req, res) {
  const { data: jobs } = await supabase
    .from('suggest_jobs')
    .select('*')
    .eq('status', 'pending');
  for (const job of jobs) {
    try {
      const suggestions = await suggestEdits(job.original, job.jd);
      await supabase
        .from('suggest_jobs')
        .update({ suggestions, status: 'complete', completed_at: new Date() })
        .eq('id', job.id);
    } catch (err) {
      await supabase
        .from('suggest_jobs')
        .update({ status: 'error', error: String(err) })
        .eq('id', job.id);
    }
  }
  res.status(200).json({ processed: jobs.length });
}
