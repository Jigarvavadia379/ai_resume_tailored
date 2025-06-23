import type { NextApiRequest, NextApiResponse } from 'next';
import { suggestEdits } from '../../lib/huggingface';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { original, jd } = req.body;
  if (!original || !jd) {
    return res.status(400).json({ error: "Missing resume or job description" });
  }
  try {
    const suggestions = await suggestEdits(original, jd);
    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Suggest API Error:", error);
    return res.status(500).json({ error: "Failed to generate suggestions" });
  }
}
