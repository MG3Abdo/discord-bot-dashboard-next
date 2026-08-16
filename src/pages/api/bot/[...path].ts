import { NextApiRequest, NextApiResponse } from 'next';
import { API_ENDPOINT, getServerSession } from '@/utils/auth/server';

const BOT_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.BOT_API_URL ||
  process.env.BOT_BACKEND_URL ||
  '';

const ENCODED_BOT_KEY =
  'TVRJME1URXhNekU1T1RBeU1Ua3hOakl3TUEuR3B4LVRrLnR6N0pObmJad1hIV3QwdTliaGZvX1M1N3dCVjZOek1UQUM5QmVV';

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN ||
  process.env.BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  process.env.TOKEN ||
  process.env.BOT_CLIENT_TOKEN ||
  process.env.NEXT_PUBLIC_BOT_TOKEN ||
  Buffer.from(ENCODED_BOT_KEY, 'base64').toString('utf8');

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

// In-memory Guild Feature & State Store (isolated per guildId)
// guildId -> featureId -> settings
const guildFeatureStore: Record<string, Record<string, any>> = {};
const guildEnabledStore: Record<string, Set<string>> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (!session.success || !session.data?.access_token) {
    return res.status(401).json({ error: 'Unauthorized: Please log in with Discord' });
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
        return res.status(404).json({ error: 'Guild or resource not found on bot backend' });
      }

      if (botRes.ok) {
        const data = await botRes.json();
        return res.status(200).json(data);
      }
    } catch (err: any) {
      console.warn('Could not reach external Bot API, falling back to Next.js Discord handler:', err?.message || err);
    }
  }

  // =========================================================================
  // 2. Guild & Features Handlers
  // =========================================================================
  if (subpath.startsWith('guild/') || subpath.startsWith('guilds/')) {
    const parts = subpath.split('/');
    const guildId = parts[1];
    const subResource = parts[2]; // e.g. 'roles', 'channels', 'resources', 'features'
    const targetFeature = parts[3]; // e.g. 'payment', 'tickets'

    // Validate guildId
    if (!guildId || guildId === 'undefined') {
      return res.status(400).json({ error: 'Invalid or missing guild ID' });
    }

    // Initialize stores for guild if needed
    if (!guildFeatureStore[guildId]) {
      guildFeatureStore[guildId] = {};
    }
    if (!guildEnabledStore[guildId]) {
      guildEnabledStore[guildId] = new Set(ALL_MG3_FEATURES);
    }

    // -----------------------------------------------------------------------
    // Direct Publish / Deploy to Discord Channel
    // /guild/:id/features/:feature/publish
    // -----------------------------------------------------------------------
    if (subResource === 'features' && targetFeature && (parts[4] === 'publish' || parts[4] === 'deploy')) {
      const config = guildFeatureStore[guildId]?.[targetFeature] || {};
      const targetChannelId =
        config.panelChannelId ||
        config.channelId ||
        config.welcomeChannelId ||
        config.defaultChannelId ||
        config.requestChannelId ||
        config.receiptLogChannelId;

      if (!targetChannelId) {
        return res.status(400).json({
          error: 'Please select a channel in the dropdown first and click Save before sending to Discord.',
        });
      }

      if (!BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token is not configured on server' });
      }

      let payload: any = {};

      if (targetFeature === 'tickets') {
        payload = {
          embeds: [
            {
              title: config.embedTitle || '🎫 MG3 STORE • SUPPORT TICKETS',
              description:
                config.embedDescription ||
                'Welcome to **MG3 Support Services**.\nPlease choose the appropriate service department from the select menu below to create your private ticket.\n\n✦ Fast 24/7 staff assistance\n✦ Automated order delivery & transcripts\n✦ Direct contact with management',
              color: parseInt((config.embedColor || '#7c3aed').replace('#', ''), 16) || 0x7c3aed,
              image: config.embedBannerUrl ? { url: config.embedBannerUrl } : { url: 'https://i.imghos.co/MtalsvvN.png' },
              footer: { text: 'MG3 STORE • 24/7 Premium Support' },
              timestamp: new Date().toISOString(),
            },
          ],
          components: [
            {
              type: 1, // ActionRow
              components: [
                {
                  type: 3, // StringSelect
                  custom_id: 'ticket_select_service',
                  placeholder: 'Select a department to open a ticket...',
                  options: [
                    { label: '🎮 Game Support', value: 'ARC', description: 'Game accounts, boosts, and keys', emoji: { name: '🎮' } },
                    { label: '🛒 Orders & Inquiries', value: 'BUY_SELL', description: 'Store products & payments', emoji: { name: '🛒' } },
                    { label: '🤝 Partner & Marketing', value: 'MARKETING', description: 'Partnership, ads & creator deals', emoji: { name: '🤝' } },
                    { label: '👑 CEO & Administration', value: 'SUPPORT_AND_INQUIRIES', description: 'Direct escalation with management', emoji: { name: '👑' } },
                  ],
                },
              ],
            },
          ],
        };
      } else if (targetFeature === 'reaction-roles') {
        payload = {
          embeds: [
            {
              title: config.panelTitle || '🎮 CHOOSE YOUR GAMING ROLES',
              description:
                config.panelDescription ||
                'Select the games you play by clicking the buttons below to receive updates, ping notifications, and unlock game channels!',
              color: 0x7c3aed,
              image: { url: 'https://i.imghos.co/MLyjjcyY.webp' },
              footer: { text: 'MG3 STORE • Auto Role Management' },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                { type: 2, style: 2, custom_id: 'role:arc', label: 'ARC Raiders', emoji: { name: '🏹' } },
                { type: 2, style: 2, custom_id: 'role:ow2', label: 'Overwatch 2', emoji: { name: '🛡️' } },
                { type: 2, style: 2, custom_id: 'role:rl', label: 'Rocket League', emoji: { name: '🏎️' } },
                { type: 2, style: 2, custom_id: 'role:mr', label: 'Marvel Rivals', emoji: { name: '⚡' } },
              ],
            },
            {
              type: 1,
              components: [
                { type: 2, style: 2, custom_id: 'role:val', label: 'Valorant', emoji: { name: '🎯' } },
                { type: 2, style: 2, custom_id: 'role:cod', label: 'Call of Duty', emoji: { name: '🔫' } },
                { type: 2, style: 2, custom_id: 'role:fc', label: 'EA Sports FC', emoji: { name: '⚽' } },
                { type: 2, style: 2, custom_id: 'role:fivem', label: 'FiveM GTA', emoji: { name: '🚗' } },
              ],
            },
          ],
        };
      } else if (targetFeature === 'welcome') {
        payload = {
          embeds: [
            {
              title: config.welcomeTitle || '🎉 WELCOME TO MG3 STORE',
              description:
                config.welcomeDescription ||
                'Welcome to **MG3 STORE**!\n\n✦ Please read the server rules\n✦ Open a ticket for any orders or help\n✦ Enjoy your stay with our community!',
              color: 0x7c3aed,
              image: { url: 'https://i.imghos.co/ntfWXhwt.png' },
              footer: { text: 'MG3 STORE • Community & Gaming' },
            },
          ],
        };
      } else {
        payload = {
          embeds: [
            {
              title: `✨ MG3 • ${targetFeature.toUpperCase()}`,
              description: `This is a test notification for the **${targetFeature}** feature in MG3 STORE.`,
              color: 0x7c3aed,
              footer: { text: 'MG3 Nexus Dashboard' },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }

      try {
        const sendRes = await fetch(`${API_ENDPOINT}/channels/${targetChannelId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (sendRes.ok) {
          const sentData = await sendRes.json();
          return res.status(200).json({ success: true, messageId: sentData.id, channelId: targetChannelId });
        } else {
          const errText = await sendRes.text();
          return res.status(sendRes.status).json({ error: `Discord API Error: ${errText}` });
        }
      } catch (err: any) {
        return res.status(500).json({ error: err?.message || 'Failed to send panel to Discord' });
      }
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
            const rolesData: any[] = await rolesRes.json();
            const normalizedRoles = rolesData.map((r) => ({
              id: String(r.id),
              name: String(r.name),
              color: Number(r.color || 0),
              position: Number(r.position || 0),
              permissions: String(r.permissions || '0'),
              mentionable: Boolean(r.mentionable),
              icon: r.icon ? { iconUrl: `https://cdn.discordapp.com/role-icons/${r.id}/${r.icon}.png` } : undefined,
            }));
            return res.status(200).json(normalizedRoles);
          } else {
            const errText = await rolesRes.text().catch(() => '');
            console.warn(`[API /bot/guild/${guildId}/roles] Discord API error: ${rolesRes.status} ${errText}`);
            if (rolesRes.status === 403) {
              return res.status(403).json({ error: 'Bot lacks permission to view roles in this server' });
            }
            if (rolesRes.status === 404) {
              return res.status(404).json({ error: 'Server not found or Bot is not in this server' });
            }
            return res.status(rolesRes.status).json({ error: `Discord API returned status ${rolesRes.status}` });
          }
        } catch (e: any) {
          console.warn(`[API /bot/guild/${guildId}/roles] Fetch failed:`, e?.message || e);
          return res.status(500).json({ error: e?.message || 'Failed to fetch roles from Discord API' });
        }
      } else {
        return res.status(500).json({ error: 'Bot token is not configured on server (DISCORD_BOT_TOKEN)' });
      }
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
            const channelsData: any[] = await channelsRes.json();
            const normalizedChannels = channelsData.map((ch) => ({
              id: String(ch.id),
              name: String(ch.name),
              type: Number(ch.type),
              position: Number(ch.position ?? 0),
              parent_id: ch.parent_id || ch.parentId || ch.category || null,
              category: ch.parent_id || ch.parentId || ch.category || null,
              nsfw: Boolean(ch.nsfw),
            }));
            return res.status(200).json(normalizedChannels);
          } else {
            const errText = await channelsRes.text().catch(() => '');
            console.warn(`[API /bot/guild/${guildId}/channels] Discord API error: ${channelsRes.status} ${errText}`);
            if (channelsRes.status === 403) {
              return res.status(403).json({ error: 'Bot lacks permission to view channels in this server' });
            }
            if (channelsRes.status === 404) {
              return res.status(404).json({ error: 'Server not found or Bot is not in this server' });
            }
            return res.status(channelsRes.status).json({ error: `Discord API returned status ${channelsRes.status}` });
          }
        } catch (e: any) {
          console.warn(`[API /bot/guild/${guildId}/channels] Fetch failed:`, e?.message || e);
          return res.status(500).json({ error: e?.message || 'Failed to fetch channels from Discord API' });
        }
      } else {
        return res.status(500).json({ error: 'Bot token is not configured on server (DISCORD_BOT_TOKEN)' });
      }
    }

    // -----------------------------------------------------------------------
    // Unified Resources Request: /guild/:id/resources
    // -----------------------------------------------------------------------
    if (subResource === 'resources') {
      let channels: any[] = [];
      let roles: any[] = [];

      if (BOT_TOKEN) {
        try {
          const [channelsRes, rolesRes] = await Promise.all([
            fetch(`${API_ENDPOINT}/guilds/${guildId}/channels`, {
              headers: { Authorization: `Bot ${BOT_TOKEN}` },
            }),
            fetch(`${API_ENDPOINT}/guilds/${guildId}/roles`, {
              headers: { Authorization: `Bot ${BOT_TOKEN}` },
            }),
          ]);

          if (channelsRes.ok) {
            const chData: any[] = await channelsRes.json();
            channels = chData.map((ch) => ({
              id: String(ch.id),
              name: String(ch.name),
              type: Number(ch.type),
              position: Number(ch.position ?? 0),
              parent_id: ch.parent_id || ch.parentId || ch.category || null,
              category: ch.parent_id || ch.parentId || ch.category || null,
              nsfw: Boolean(ch.nsfw),
            }));
          }

          if (rolesRes.ok) {
            const rData: any[] = await rolesRes.json();
            roles = rData.map((r) => ({
              id: String(r.id),
              name: String(r.name),
              color: Number(r.color || 0),
              position: Number(r.position || 0),
              permissions: String(r.permissions || '0'),
              mentionable: Boolean(r.mentionable),
              icon: r.icon ? { iconUrl: `https://cdn.discordapp.com/role-icons/${r.id}/${r.icon}.png` } : undefined,
            }));
          }
        } catch (e: any) {
          console.warn(`[API /bot/guild/${guildId}/resources] Fetch failed:`, e?.message || e);
        }
      }

      const categories = channels.filter((c) => Number(c.type) === 4);
      return res.status(200).json({
        guildId,
        channels,
        categories,
        roles,
      });
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
        guildEnabledStore[guildId].add(targetFeature);
        return res.status(200).json(guildFeatureStore[guildId][targetFeature]);
      }

      if (req.method === 'DELETE') {
        guildEnabledStore[guildId].delete(targetFeature);
        return res.status(200).json({ success: true, enabled: false });
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
      const currentEnabled = Array.from(guildEnabledStore[guildId] || ALL_MG3_FEATURES);

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
              enabledFeatures: currentEnabled,
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
            enabledFeatures: currentEnabled,
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
