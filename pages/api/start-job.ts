// pages/api/start-suggest.ts
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { original, jd } = req.body;
  const { data, error } = await supabase
    .from('suggest_jobs')
    .insert([{ original, jd, status: 'pending', created_at: new Date() }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: 'Failed to create job' });
  res.status(200).json({ jobId: data.id });
}
