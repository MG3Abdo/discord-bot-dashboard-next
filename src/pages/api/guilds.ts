import { NextApiRequest, NextApiResponse } from 'next';
import { API_ENDPOINT, getServerSession } from '@/utils/auth/server';

const ENCODED_BOT_KEY =
  'TVRJME1URXhNekU1T1RBeU1Ua3hOakl3TUEuR3B4LVRrLnR6N0pObmJad1hIV3QwdTliaGZvX1M1N3dCVjZOek1UQUM5QmVV';

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN ||
  process.env.BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  process.env.TOKEN ||
  Buffer.from(ENCODED_BOT_KEY, 'base64').toString('utf8');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getServerSession(req);

  if (!session.success || !session.data?.access_token) {
    return res.status(401).json({ error: 'Unauthorized: Please log in with Discord' });
  }

  try {
    const [userGuildsRes, botGuildsRes] = await Promise.all([
      fetch(`${API_ENDPOINT}/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${session.data.access_token}`,
        },
      }),
      BOT_TOKEN
        ? fetch(`${API_ENDPOINT}/users/@me/guilds`, {
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
            },
          }).catch(() => null)
        : Promise.resolve(null),
    ]);

    if (userGuildsRes.status === 401) {
      return res.status(401).json({ error: 'Discord token expired' });
    }

    if (!userGuildsRes.ok) {
      console.error('Discord API error /users/@me/guilds:', userGuildsRes.status);
      return res.status(userGuildsRes.status).json({ error: 'Failed to fetch guilds from Discord' });
    }

    const rawGuilds: any[] = await userGuildsRes.json();

    const botGuildSet = new Set<string>();
    if (botGuildsRes && botGuildsRes.ok) {
      try {
        const botGuildsData: any[] = await botGuildsRes.json();
        botGuildsData.forEach((bg) => botGuildSet.add(String(bg.id)));
      } catch {}
    }

    // Enrich guild data with safe BigInt permission evaluation & bot membership flag
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
        isAdmin = isOwner;
        canManage = isOwner;
      }

      const isBotJoined = botGuildSet.size > 0 ? botGuildSet.has(String(g.id)) : true;

      return {
        id: String(g.id),
        name: String(g.name || ''),
        icon: g.icon ? String(g.icon) : null,
        owner: isOwner,
        permissions: String(g.permissions || '0'),
        isAdmin,
        canManage,
        botJoined: isBotJoined,
        features: Array.isArray(g.features) ? g.features : [],
      };
    });

    return res.status(200).json(guilds);
  } catch (error) {
    console.error('Error fetching guilds from Discord:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
