// pages/api/job-status.ts
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;
  const { data, error } = await supabase
    .from('suggest_jobs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(data);
}
