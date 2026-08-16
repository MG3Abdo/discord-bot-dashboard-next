import { NextApiRequest, NextApiResponse } from 'next';
import { API_ENDPOINT, getServerSession } from '@/utils/auth/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getServerSession(req);

  if (!session.success || !session.data?.access_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/users/@me`, {
      headers: {
        Authorization: `Bearer ${session.data.access_token}`,
      },
    });

    if (response.status === 401) {
      return res.status(401).json({ error: 'Discord token expired' });
    }

    if (!response.ok) {
      console.error('Discord API error /users/@me:', response.status);
      return res.status(response.status).json({ error: 'Failed to fetch user data from Discord' });
    }

    const userData = await response.json();
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data from Discord:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
