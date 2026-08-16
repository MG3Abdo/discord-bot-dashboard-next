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
    const response = await fetch(`${API_ENDPOINT}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${session.data.access_token}`,
      },
    });

    if (response.status === 401) {
      return res.status(401).json({ error: 'Discord token expired' });
    }

    if (!response.ok) {
      console.error('Discord API error /users/@me/guilds:', response.status);
      return res.status(response.status).json({ error: 'Failed to fetch guilds from Discord' });
    }

    const rawGuilds: any[] = await response.json();

    // Enrich guild data with safe BigInt permission evaluation
    const guilds = rawGuilds.map((g) => {
      const isOwner = Boolean(g.owner);
      let isAdmin = isOwner;
      let canManage = isOwner;

      try {
        const perms = BigInt(g.permissions || '0');
        // Discord Permission Flags:
        // ADMINISTRATOR = 1n << 3n (8)
        // MANAGE_GUILD = 1n << 5n (32)
        const adminBit = BigInt(8);
        const manageBit = BigInt(32);
        isAdmin = isOwner || (perms & adminBit) === adminBit;
        canManage = isAdmin || (perms & manageBit) === manageBit;
      } catch {
        // Fallback if permissions string parsing fails
        isAdmin = isOwner;
        canManage = isOwner;
      }

      return {
        id: String(g.id),
        name: String(g.name || ''),
        icon: g.icon ? String(g.icon) : null,
        owner: isOwner,
        permissions: String(g.permissions || '0'),
        isAdmin,
        canManage,
        features: Array.isArray(g.features) ? g.features : [],
      };
    });

    return res.status(200).json(guilds);
  } catch (error) {
    console.error('Error fetching guilds from Discord:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
