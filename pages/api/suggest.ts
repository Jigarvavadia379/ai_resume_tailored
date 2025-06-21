import type { NextApiRequest, NextApiResponse } from 'next';
import { suggestEdits } from '../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', 'POST').status(405).json({ error: 'Method Not Allowed' });
  }

  const { original, jd } = req.body as { original?: string; jd?: string };

  if (!original || !jd) {
    return res.status(400).json({ error: 'Missing resume or job description' });
  }

  try {
    const suggestions = await suggestEdits(original, jd);
    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Suggest API Error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
