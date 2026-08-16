import { NextApiRequest, NextApiResponse } from 'next';
import { API_ENDPOINT, getServerSession } from '@/utils/auth/server';

const BOT_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BOT_API_URL ||
  '';

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN ||
  process.env.BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  '';

const DASHBOARD_API_TOKEN = process.env.DASHBOARD_API_TOKEN || '';

const ALL_MG3_FEATURES = [
  'tickets',
  'server-logs',
  'welcome',
  'invite-log',
  'blacklist',
  'suggestions',
  'feedback',
  'marketing-requests',
  'reaction-roles',
  'say',
  'payment',
];

// In-memory Guild Feature Store (isolated per guildId)
// guildId -> featureId -> settings
const guildFeatureStore: Record<string, Record<string, any>> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (!session.success || !session.data?.access_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { path } = req.query as { path?: string[] };
  const subpath = Array.isArray(path) ? path.join('/') : path || '';

  // =========================================================================
  // 1. External Bot API Backend (e.g. Railway or Express API)
  // =========================================================================
  if (BOT_API_URL && !BOT_API_URL.includes('localhost:8080')) {
    try {
      const normalizedBase = BOT_API_URL.endsWith('/')
        ? BOT_API_URL.slice(0, -1)
        : BOT_API_URL;

      const targetUrl = normalizedBase.includes('/api/bot')
        ? `${normalizedBase}/${subpath}`
        : `${normalizedBase}/api/bot/${subpath}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (DASHBOARD_API_TOKEN) {
        headers['Authorization'] = `Bearer ${DASHBOARD_API_TOKEN}`;
      } else {
        headers['Authorization'] = `${session.data.token_type} ${session.data.access_token}`;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const botRes = await fetch(targetUrl, fetchOptions);

      if (botRes.status === 404) {
        return res.status(404).json({ error: 'Guild or resource not found on bot' });
      }

      if (botRes.ok) {
        const data = await botRes.json();
        return res.status(200).json(data);
      }
    } catch (err: any) {
      console.warn('Could not reach external Bot API, falling back to Next.js handler:', err?.message || err);
    }
  }

  // =========================================================================
  // 2. Guild & Features Handlers
  // =========================================================================
  if (subpath.startsWith('guild/') || subpath.startsWith('guilds/')) {
    const parts = subpath.split('/');
    const guildId = parts[1];
    const subResource = parts[2]; // e.g. 'roles', 'channels', 'features'
    const targetFeature = parts[3]; // e.g. 'payment', 'tickets'

    // Initialize store for guild if needed
    if (!guildFeatureStore[guildId]) {
      guildFeatureStore[guildId] = {};
    }

    // -----------------------------------------------------------------------
    // Roles Request: /guild/:id/roles
    // -----------------------------------------------------------------------
    if (subResource === 'roles') {
      if (BOT_TOKEN) {
        try {
          const rolesRes = await fetch(`${API_ENDPOINT}/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` },
          });
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            return res.status(200).json(rolesData);
          }
        } catch (e) {
          console.warn('Error fetching roles with Bot Token:', e);
        }
      }
      return res.status(200).json([]);
    }

    // -----------------------------------------------------------------------
    // Channels Request: /guild/:id/channels
    // -----------------------------------------------------------------------
    if (subResource === 'channels') {
      if (BOT_TOKEN) {
        try {
          const channelsRes = await fetch(`${API_ENDPOINT}/guilds/${guildId}/channels`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` },
          });
          if (channelsRes.ok) {
            const channelsData = await channelsRes.json();
            return res.status(200).json(channelsData);
          }
        } catch (e) {
          console.warn('Error fetching channels with Bot Token:', e);
        }
      }
      return res.status(200).json([]);
    }

    // -----------------------------------------------------------------------
    // Specific Feature Request: /guild/:id/features/:feature
    // -----------------------------------------------------------------------
    if (subResource === 'features' && targetFeature) {
      if (req.method === 'GET') {
        const saved = guildFeatureStore[guildId]?.[targetFeature] || {};
        return res.status(200).json(saved);
      }

      if (req.method === 'POST' || req.method === 'PATCH') {
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        guildFeatureStore[guildId][targetFeature] = {
          ...(guildFeatureStore[guildId][targetFeature] || {}),
          ...bodyData,
        };
        return res.status(200).json(guildFeatureStore[guildId][targetFeature]);
      }

      if (req.method === 'DELETE') {
        delete guildFeatureStore[guildId][targetFeature];
        return res.status(200).json({ success: true });
      }
    }

    // -----------------------------------------------------------------------
    // General Features Request: /guild/:id/features
    // -----------------------------------------------------------------------
    if (subResource === 'features') {
      if (req.method === 'GET') {
        return res.status(200).json(guildFeatureStore[guildId] || {});
      }
      return res.status(200).json({ success: true });
    }

    // -----------------------------------------------------------------------
    // Guild Info Request: /guild/:id
    // -----------------------------------------------------------------------
    if (req.method === 'GET' && parts.length === 2) {
      // Check via Bot Token first
      if (BOT_TOKEN) {
        try {
          const discordRes = await fetch(`${API_ENDPOINT}/guilds/${guildId}`, {
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
            },
          });

          if (discordRes.ok) {
            const guildData = await discordRes.json();
            return res.status(200).json({
              id: String(guildData.id),
              name: String(guildData.name),
              icon: guildData.icon,
              owner_id: guildData.owner_id,
              enabledFeatures: ALL_MG3_FEATURES,
              settings: guildFeatureStore[guildId] || {},
            });
          } else if (discordRes.status === 404 || discordRes.status === 403) {
            return res.status(404).json({ error: 'Bot not joined in this guild', guildId });
          }
        } catch (botErr) {
          console.warn('Error querying Discord Bot API:', botErr);
        }
      }

      // Check via User's OAuth Admin status
      try {
        const userGuildsRes = await fetch(`${API_ENDPOINT}/users/@me/guilds`, {
          headers: {
            Authorization: `Bearer ${session.data.access_token}`,
          },
        });

        if (userGuildsRes.ok) {
          const userGuilds: any[] = await userGuildsRes.json();
          const matchedGuild = userGuilds.find((g) => String(g.id) === String(guildId));

          if (!matchedGuild) {
            return res.status(404).json({ error: 'Guild not found in user account' });
          }

          const isOwner = Boolean(matchedGuild.owner);
          let canManage = isOwner;
          try {
            const perms = BigInt(matchedGuild.permissions || '0');
            canManage = isOwner || (perms & BigInt(8)) === BigInt(8) || (perms & BigInt(32)) === BigInt(32);
          } catch {
            canManage = isOwner;
          }

          if (!canManage) {
            return res.status(403).json({ error: 'Forbidden: Missing administrator permissions' });
          }

          return res.status(200).json({
            id: String(matchedGuild.id),
            name: String(matchedGuild.name),
            icon: matchedGuild.icon,
            owner: isOwner,
            enabledFeatures: ALL_MG3_FEATURES,
            settings: guildFeatureStore[guildId] || {},
          });
        }
      } catch (oauthErr) {
        console.error('Error verifying user guild access:', oauthErr);
      }
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
  }

  // List all bot guilds
  if (subpath === 'guilds' || subpath === '') {
    return res.status(200).json([]);
  }

  return res.status(404).json({ error: 'Not found' });
}
