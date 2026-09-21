import type { NextApiRequest, NextApiResponse } from 'next';
import { getInitialTasks } from '@/libs/initialData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    const tasks = getInitialTasks();
    return res.status(200).json(tasks);
  }

  if (req.method === 'POST') {
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }
    return res.status(201).json({ message: 'Task received', task: req.body });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
