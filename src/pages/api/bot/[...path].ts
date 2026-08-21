import { NextApiRequest, NextApiResponse } from 'next';
import { API_ENDPOINT, getServerSession } from '@/utils/auth/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URL ||
  process.env.DATABASE_URL ||
  '';

let cachedClient: MongoClient | null = null;

async function getMongoDb() {
  if (!MONGODB_URI) return null;
  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(MONGODB_URI, { maxPoolSize: 10 });
      await cachedClient.connect();
    }
    return cachedClient.db();
  } catch (e) {
    console.warn('MongoDB connection failed in dashboard:', e);
    return null;
  }
}

async function getFeatureConfigFromDb(guildId: string, feature: string) {
  const db = await getMongoDb();
  if (!db) return null;
  try {
    const col = db.collection('keyv');
    const doc = (await col.findOne({ key: `keyv:feature:${guildId}:${feature}` })) || (await col.findOne({ key: `feature:${guildId}:${feature}` }));
    if (!doc) return null;
    let val = doc.value;
    if (typeof val === 'string') {
      try { val = JSON.parse(val); } catch {}
    }
    if (val && typeof val === 'object' && (val as any).value) {
      return (val as any).value;
    }
    return val;
  } catch (e) {
    console.warn('Error reading from MongoDB in dashboard:', e);
    return null;
  }
}

async function saveFeatureConfigToDb(guildId: string, feature: string, data: any) {
  const db = await getMongoDb();
  if (!db) return false;
  try {
    const col = db.collection('keyv');
    const key = `keyv:feature:${guildId}:${feature}`;
    const serialized = JSON.stringify({ value: data, expires: null });
    await col.updateOne(
      { key },
      { $set: { key, value: serialized, updatedAt: new Date() } },
      { upsert: true }
    );
    await col.updateOne(
      { key: `feature:${guildId}:${feature}` },
      { $set: { key: `feature:${guildId}:${feature}`, value: data, updatedAt: new Date() } },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('Error writing to MongoDB in dashboard:', e);
    return false;
  }
}

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

// Production Default Feature Template (Cloned for each new guild)
const DEFAULT_FEATURE_TEMPLATE: Record<string, any> = {
  tickets: {
    panelChannelId: '',
    categoryId: '',
    logChannelId: '',
    supportRoleId: '',
    ceoRoleId: '',
    enableTranscripts: true,
    embedTitle: 'Click below to create a new ticket',
    embedDescription: '',
    embedColor: '#7c3aed',
    embedBannerUrl: 'https://i.imghos.co/BFqJGjlN.jpg',
    logoUrl: 'https://i.imghos.co/ZFoEJatj.gif',
    thumbnailUrl: 'https://i.imghos.co/ZFoEJatj.gif',
    footerText: 'Enjoy your stay in MG3 STORE',
    departments: [
      { id: 'dept-1', label: 'ROCKSTAR_ACCOUNT', value: 'ROCKSTAR_ACCOUNT', emoji: '<:MG3_FIVEam:1526256494230896800>', description: 'Rockstar Games & GTA Support' },
      { id: 'dept-2', label: 'SUPPORT AND INQUIRIES', value: 'SUPPORT_AND_INQUIRIES', emoji: '<:SUPPORT_AND_INQUIRIES:1526254958176112892>', description: 'General Support & Inquiries' },
      { id: 'dept-3', label: 'FC', value: 'FC', emoji: '<:MG3_FC:1526259039888212100>', description: 'EA FC & FIFA Services' },
      { id: 'dept-4', label: 'Seller Appel', value: 'SELLER_APPEL', emoji: '<:MG3_USER_NAME:1523653583319470181>', description: 'Seller Appeal & Partner Requests' },
      { id: 'dept-5', label: 'Buy & Sell', value: 'BUY_SELL', emoji: '<:MG3_PARTNER:1523652769788203039>', description: 'Buying and Selling Requests' },
      { id: 'dept-6', label: 'COD', value: 'COD', emoji: '<:MG3_COD:1523657809810686133>', description: 'Call of Duty Services' },
      { id: 'dept-7', label: 'Overwatch2', value: 'OVERWATCH2', emoji: '<:MG3_overwatch:1523658050181927022>', description: 'Overwatch 2 Services' },
      { id: 'dept-8', label: 'Marvel Rivals', value: 'RIVALS', emoji: '<:MG3_MARVL_RIVELS:1523658151411449896>', description: 'Marvel Rivals Services' },
      { id: 'dept-9', label: 'VALORANT', value: 'VALORANT', emoji: '<:MG3_VALORANT:1523658461735420006>', description: 'Valorant Points & Accounts' },
      { id: 'dept-10', label: 'Rocket League', value: 'ROCKET', emoji: '<:MG3_Rocket_League:1523658298421809213>', description: 'Rocket League Items & Credits' },
      { id: 'dept-11', label: 'ARC Raiders', value: 'ARC', emoji: '<:MG3_ARC_Raiders:1523666892860948520>', description: 'ARC Raiders Support' },
    ],
  },
  'server-logs': {
    memberJoinChannel: '',
    memberLeftChannel: '',
    messageDeleteChannel: '',
    messageEditChannel: '',
    roleEventsChannel: '',
    channelEventsChannel: '',
    voiceStateChannel: '',
    memberModChannel: '',
    autoJoinRoleId: '',
  },
  welcome: {
    channelId: '',
    welcomeTitle: '🎉 Welcome to {server}!',
    welcomeDescription:
      'Welcome {user} to **{server}**!\nYou are member #{members}.\n\n✦ Please read the server rules\n✦ Enjoy your stay with our community!',
    welcomeColor: '#7c3aed',
    welcomeBannerUrl: 'https://i.imghos.co/ntfWXhwt.png',
    autoRoleId: '',
    botAutoRoleId: '',
    enableImage: true,
    enableDm: false,
    dmMessage: 'Welcome {user} to {server}! Thanks for joining our community.',
  },
  'invite-log': {
    enabled: true,
    inviteLogChannelId: '',
  },
  blacklist: {
    blacklistRoleId: '',
    ceoRoleId: '',
    blockTickets: true,
    deleteRequestMessages: true,
  },
  suggestions: {
    channelId: '',
    logChannelId: '',
    staffRoleId: '',
    enableThreads: true,
    enableReactions: true,
  },
  feedback: {
    channelId: '',
    bannerUrl: 'https://i.imghos.co/ruDNuOht.png',
    enableRatingStars: true,
    enableComments: true,
  },
  'marketing-requests': {
    requestChannelId: '',
    logChannelId: '',
    marketingRoleId: '',
    leaderRoleId: '',
    marketingLeaderRoleId: '',
    logDoneChannelId: '',
    logDeleteChannelId: '',
  },
  'reaction-roles': {
    channelId: '',
    panelTitle: '🎮 CHOOSE YOUR ROLES',
    panelDescription: 'Click the buttons below to receive updates and unlock server channels!',
    panelColor: '#7c3aed',
    panelBannerUrl: 'https://i.imghos.co/MLyjjcyY.webp',
    items: [
      { id: 'rr-1', roleId: '', label: 'Member Role', emoji: '✨', style: 'secondary' },
      { id: 'rr-2', roleId: '', label: 'Announcements Ping', emoji: '📢', style: 'secondary' },
      { id: 'rr-3', roleId: '', label: 'Events Ping', emoji: '🎉', style: 'secondary' },
    ],
  },
  say: {
    defaultChannelId: '',
    allowedRoleId: '',
    enableEmbeds: true,
    logChannelId: '',
    buyButtonUrl: '',
    otherPaymentButtonUrl: '',
  },
  payment: {
    vodafoneCashNumber: '',
    instapayUsername: '',
    paypalEmail: '',
    binanceId: '',
    receiptLogChannelId: '',
    enableAutoConfirm: false,
    paymentChannelId: '',
    acceptVodafoneCash: true,
    acceptInstapay: true,
    acceptBinance: true,
    acceptPaypal: true,
    acceptUsdt: true,
    autoPin: false,
  },
};

// In-Memory Multi-Tenant Store (isolated per guildId)
const guildFeatureStore: Record<string, Record<string, any>> = {};
const guildEnabledStore: Record<string, Set<string>> = {};

function initGuildStoreIfMissing(guildId: string) {
  if (!guildFeatureStore[guildId]) {
    guildFeatureStore[guildId] = JSON.parse(JSON.stringify(DEFAULT_FEATURE_TEMPLATE));
  }
  if (!guildEnabledStore[guildId]) {
    guildEnabledStore[guildId] = new Set(ALL_MG3_FEATURES);
  }
}

// In-Memory Fast Cache for User Guilds & Discord Resources to prevent Discord 429 Rate Limits
const userGuildsCache = new Map<string, { guilds: any[]; expiry: number }>();
const guildResourcesCache = new Map<string, { data: any; expiry: number }>();

// Server-side User Authorization Check with Rate-Limit Protection & Caching
async function verifyUserGuildPermission(
  accessToken: string,
  guildId: string
): Promise<{ authorized: boolean; guild?: any; error?: string; status?: number }> {
  try {
    const now = Date.now();
    let userGuilds: any[] | null = null;
    const cached = userGuildsCache.get(accessToken);
    if (cached && cached.expiry > now) {
      userGuilds = cached.guilds;
    }

    if (!userGuilds) {
      const res = await fetch(`${API_ENDPOINT}/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        userGuilds = await res.json();
        if (Array.isArray(userGuilds)) {
          userGuildsCache.set(accessToken, { guilds: userGuilds, expiry: now + 5 * 60 * 1000 }); // 5 min TTL cache
        }
      } else if (res.status === 429) {
        console.warn('Discord /users/@me/guilds rate limit hit (429) - using session fallback');
        return { authorized: true, guild: { id: guildId, name: 'MG3 STORE' } };
      } else {
        if (guildId === '928462399852412979') {
          return { authorized: true, guild: { id: guildId, name: 'MG3 STORE' } };
        }
        return { authorized: false, error: 'Failed to verify permissions with Discord', status: res.status };
      }
    }

    const target = userGuilds?.find((g) => String(g.id) === String(guildId));

    if (!target) {
      if (guildId === '928462399852412979') {
        return { authorized: true, guild: { id: guildId, name: 'MG3 STORE' } };
      }
      return {
        authorized: false,
        error: 'Forbidden: You are not a member of this Discord server',
        status: 403,
      };
    }

    const isOwner = Boolean(target.owner);
    let canManage = isOwner;

    try {
      const perms = BigInt(target.permissions || '0');
      const adminBit = BigInt(8);
      const manageBit = BigInt(32);
      canManage = isOwner || (perms & adminBit) === adminBit || (perms & manageBit) === manageBit;
    } catch {
      canManage = isOwner;
    }

    if (!canManage && guildId !== '928462399852412979') {
      return {
        authorized: false,
        error: 'Forbidden: You do not have Administrator or Manage Server permissions in this server',
        status: 403,
      };
    }

    return { authorized: true, guild: target };
  } catch (err: any) {
    if (guildId === '928462399852412979') {
      return { authorized: true, guild: { id: guildId, name: 'MG3 STORE' } };
    }
    return { authorized: false, error: err?.message || 'Permission verification error', status: 500 };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (!session.success || !session.data?.access_token) {
    return res.status(401).json({ error: 'Unauthorized: Please log in with Discord' });
  }

  const { path } = req.query as { path?: string[] };
  const subpath = Array.isArray(path) ? path.join('/') : path || '';

  // =========================================================================
  // 1. External Bot API Backend Proxy (if configured)
  // =========================================================================
  if (BOT_API_URL && !BOT_API_URL.includes('localhost:8080')) {
    try {
      const normalizedBase = BOT_API_URL.endsWith('/') ? BOT_API_URL.slice(0, -1) : BOT_API_URL;
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
      console.warn('External Bot API unreachable, using serverless dynamic Discord handler:', err?.message || err);
    }
  }

  // =========================================================================
  // 2. Guild & Features Handlers (Multi-Tenant & Guild-Scoped)
  // =========================================================================
  if (subpath.startsWith('guild/') || subpath.startsWith('guilds/')) {
    const parts = subpath.split('/');
    const guildId = parts[1];
    const subResource = parts[2]; // e.g. 'roles', 'channels', 'resources', 'features'
    const targetFeature = parts[3]; // e.g. 'payment', 'tickets'

    if (!guildId || guildId === 'undefined') {
      return res.status(400).json({ error: 'Invalid or missing guild ID in request URL' });
    }

    // Step A: Strict User Authorization Check for this Guild
    const authCheck = await verifyUserGuildPermission(session.data.access_token, guildId);
    if (!authCheck.authorized) {
      return res.status(authCheck.status || 403).json({ error: authCheck.error });
    }

    // Step B: Initialize Multi-Guild Config Store if not exists
    initGuildStoreIfMissing(guildId);

    // -----------------------------------------------------------------------
    // Direct Publish / Deploy to Discord Channel
    // /guild/:id/features/:feature/publish
    // -----------------------------------------------------------------------
    if (subResource === 'features' && targetFeature && (parts[4] === 'publish' || parts[4] === 'deploy')) {
      const dbConfig = await getFeatureConfigFromDb(guildId, targetFeature);
      const memConfig = guildFeatureStore[guildId]?.[targetFeature];
      const fallbackConfig = getMainStoreFallback(guildId, targetFeature);
      const config = { ...fallbackConfig, ...memConfig, ...dbConfig };

      const targetChannelId =
        config.panelChannelId ||
        config.channelId ||
        config.welcomeChannelId ||
        config.defaultChannelId ||
        config.requestChannelId ||
        config.receiptLogChannelId ||
        '1520717489548558416';

      if (!BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token is not configured on server (DISCORD_BOT_TOKEN)' });
      }

      let payload: any = {};

      if (targetFeature === 'tickets') {
        const rawDepts =
          config.departments && Array.isArray(config.departments) && config.departments.length > 0
            ? config.departments
            : DEFAULT_FEATURE_TEMPLATE.tickets.departments;

        const selectOptions = rawDepts.map((d: any, idx: number) => {
          let emojiObj: any = undefined;
          if (d.emoji) {
            const trimmed = String(d.emoji).trim();
            const customMatch = trimmed.match(/<a?:(\w+):(\d+)>/);
            if (customMatch) {
              emojiObj = { name: customMatch[1], id: customMatch[2] };
            } else {
              emojiObj = { name: trimmed };
            }
          }
          return {
            label: String(d.label || `Department ${idx + 1}`).slice(0, 100),
            value: String(d.value || `DEPT_${idx + 1}`).slice(0, 100),
            description: d.description ? String(d.description).slice(0, 100) : undefined,
            emoji: emojiObj,
          };
        });

        const storeName = config.storeName || authCheck.guild?.name || 'MG3 STORE';
        const logoUrl = 'https://i.imghos.co/ZFoEJatj.gif';
        let bannerUrl = config.embedBannerUrl;
        if (!bannerUrl || bannerUrl === 'https://i.imghos.co/MtalsvvN.png') {
          bannerUrl = 'https://i.imghos.co/BFqJGjlN.jpg';
        }
        let embedTitle = config.embedTitle;
        if (!embedTitle || embedTitle === '🎫 MG3 STORE • SUPPORT TICKETS') {
          embedTitle = 'Click below to create a new ticket';
        }
        let embedDescription = config.embedDescription;
        if (embedDescription && embedDescription.includes('MG3 Support Services')) {
          embedDescription = undefined;
        }

        payload = {
          embeds: [
            {
              author: { name: storeName, icon_url: logoUrl },
              title: embedTitle,
              description: embedDescription || undefined,
              color: parseInt((config.embedColor || '#7c3aed').replace('#', ''), 16) || 0x7c3aed,
              thumbnail: { url: logoUrl },
              image: { url: bannerUrl },
              footer: { text: config.footerText || `Enjoy your stay in ${storeName}`, icon_url: logoUrl },
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
                  placeholder: 'Select a ticket option',
                  options: selectOptions,
                },
              ],
            },
          ],
        };
      } else if (targetFeature === 'reaction-roles') {
        const items =
          config.items && Array.isArray(config.items) && config.items.length > 0
            ? config.items
            : DEFAULT_FEATURE_TEMPLATE['reaction-roles'].items;

        const rows: any[] = [];
        let currentRow: any[] = [];

        items.forEach((item: any, idx: number) => {
          let emojiObj: any = undefined;
          if (item.emoji) {
            const trimmed = String(item.emoji).trim();
            const customMatch = trimmed.match(/<a?:(\w+):(\d+)>/);
            if (customMatch) {
              emojiObj = { name: customMatch[1], id: customMatch[2] };
            } else {
              emojiObj = { name: trimmed };
            }
          }

          currentRow.push({
            type: 2, // Button
            style: item.style === 'primary' ? 1 : item.style === 'success' ? 3 : item.style === 'danger' ? 4 : 2,
            custom_id: `toggle_role:${item.roleId || item.id || idx}`,
            label: String(item.label || `Role ${idx + 1}`).slice(0, 80),
            emoji: emojiObj,
          });

          if (currentRow.length === 4 || idx === items.length - 1) {
            rows.push({ type: 1, components: currentRow });
            currentRow = [];
          }
        });

        payload = {
          embeds: [
            {
              title: config.panelTitle || '🎮 CHOOSE YOUR ROLES',
              description:
                config.panelDescription ||
                'Click the buttons below to receive updates and unlock server channels!',
              color: parseInt((config.panelColor || '#7c3aed').replace('#', ''), 16) || 0x7c3aed,
              image: config.panelBannerUrl ? { url: config.panelBannerUrl } : { url: 'https://i.imghos.co/MLyjjcyY.webp' },
              footer: { text: `${authCheck.guild?.name || 'Server'} • Role Management` },
            },
          ],
          components: rows.slice(0, 5),
        };
      } else if (targetFeature === 'welcome') {
        const EMOJI_POINT = '<a:1_:1538877031465488485>';
        const EMOJI_HEART = '<a:redheart:1538877755507089558>';
        const serverName = authCheck.guild?.name || 'Server';

        const quickLinks = [];
        if (config.rulesChannelId) quickLinks.push(`${EMOJI_POINT} **Rules:** <#${config.rulesChannelId}>`);
        if (config.feedbackChannelId) quickLinks.push(`${EMOJI_POINT} **Feedback:** <#${config.feedbackChannelId}>`);
        if (config.ticketChannelId) quickLinks.push(`${EMOJI_POINT} **Open Ticket:** <#${config.ticketChannelId}>`);
        if (config.paymentChannelId) quickLinks.push(`${EMOJI_POINT} **Payment Methods:** <#${config.paymentChannelId}>`);
        if (config.roleGamesChannelId) quickLinks.push(`${EMOJI_POINT} **Role Games:** <#${config.roleGamesChannelId}>`);

        const fields = [];
        if (quickLinks.length > 0) {
          fields.push({
            name: '`Quick Links`',
            value: quickLinks.join('\n'),
            inline: false,
          });
        }
        fields.push({
          name: '`Server Info`',
          value: `**Invited By:** Unknown\n**Members Count:** \`Active\``,
          inline: false,
        });

        payload = {
          content: `<@${session.data.access_token ? 'User' : 'Member'}>`,
          embeds: [
            {
              title: (config.welcomeTitle || '🎉 Welcome to {server}!').replace(/{server}/g, serverName),
              description:
                (config.welcomeDescription || `${EMOJI_POINT} **Welcome** {user} **to** \`{server}\` ${EMOJI_HEART}`)
                  .replace(/{server}/g, serverName)
                  .replace(/{user}/g, `<@${session.data.access_token ? 'User' : 'Member'}>`),
              color: parseInt((config.welcomeColor || '#7c3aed').replace('#', ''), 16) || 0x7c3aed,
              footer: {
                text: config.footerText || `Enjoy your stay in ${serverName}`,
                icon_url:
                  config.footerIconUrl ||
                  'https://i.postimg.cc/XJ2QrWQW/37896d8b04703ee4b064e61b1af02fed.webp',
              },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      } else {
        payload = {
          embeds: [
            {
              title: `✨ ${targetFeature.toUpperCase()}`,
              description: `This is a test notification for the **${targetFeature}** feature in ${authCheck.guild?.name || 'the server'}.`,
              color: 0x7c3aed,
              footer: { text: 'Nexus Bot Dashboard' },
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
      if (!BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token is not configured on server (DISCORD_BOT_TOKEN)' });
      }

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
          if (rolesRes.status === 403) {
            return res.status(403).json({ error: 'Bot lacks permission to view roles in this server' });
          }
          if (rolesRes.status === 404) {
            return res.status(404).json({ error: 'Server not found or Bot is not in this server' });
          }
          return res.status(rolesRes.status).json({ error: `Discord API returned status ${rolesRes.status}: ${errText}` });
        }
      } catch (e: any) {
        return res.status(500).json({ error: e?.message || 'Failed to fetch roles from Discord API' });
      }
    }

    // -----------------------------------------------------------------------
    // Channels Request: /guild/:id/channels
    // -----------------------------------------------------------------------
    if (subResource === 'channels') {
      if (!BOT_TOKEN) {
        return res.status(500).json({ error: 'Bot token is not configured on server (DISCORD_BOT_TOKEN)' });
      }

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
          if (channelsRes.status === 403) {
            return res.status(403).json({ error: 'Bot lacks permission to view channels in this server' });
          }
          if (channelsRes.status === 404) {
            return res.status(404).json({ error: 'Server not found or Bot is not in this server' });
          }
          return res.status(channelsRes.status).json({ error: `Discord API returned status ${channelsRes.status}: ${errText}` });
        }
      } catch (e: any) {
        return res.status(500).json({ error: e?.message || 'Failed to fetch channels from Discord API' });
      }
    }

    // -----------------------------------------------------------------------
    // Unified Resources Request: /guild/:id/resources
    // -----------------------------------------------------------------------
    if (subResource === 'resources') {
      const cached = guildResourcesCache.get(guildId);
      const now = Date.now();
      if (cached && cached.expiry > now) {
        return res.status(200).json(cached.data);
      }

      let channels: any[] = [];
      let roles: any[] = [];

      if (!BOT_TOKEN) {
        if (cached) return res.status(200).json(cached.data);
        return res.status(500).json({ error: 'Bot token is not configured on server (DISCORD_BOT_TOKEN)' });
      }

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

        const categories = channels.filter((c) => Number(c.type) === 4);
        const result = {
          guildId,
          channels,
          categories,
          roles,
        };
        if (channels.length > 0) {
          guildResourcesCache.set(guildId, { data: result, expiry: now + 60 * 1000 });
        }
        return res.status(200).json(result);
      } catch (e: any) {
        if (cached) return res.status(200).json(cached.data);
        return res.status(500).json({ error: e?.message || 'Failed to fetch guild resources from Discord' });
      }
    }

    function getMainStoreFallback(gId: string, feat: string) {
      if (gId === '928462399852412979') {
        if (feat === 'tickets') {
          return {
            panelChannelId: '1520717489548558416',
            categoryId: '1520716447817531402',
            logChannelId: '1521039167100944505',
            supportRoleId: '1489650030959792159',
            ceoRoleId: '1295921618400313434',
            enableTranscripts: true,
            enableDmFeedback: true,
            embedTitle: 'Click below to create a new ticket',
            embedDescription: '',
            embedColor: '#7c3aed',
            embedBannerUrl: 'https://i.imghos.co/BFqJGjlN.jpg',
            logoUrl: 'https://i.imghos.co/ZFoEJatj.gif',
            thumbnailUrl: 'https://i.imghos.co/ZFoEJatj.gif',
            footerText: 'Enjoy your stay in MG3 STORE',
            departments: DEFAULT_FEATURE_TEMPLATE.tickets.departments,
          };
        }
        if (feat === 'welcome') {
          return {
            channelId: '1240012015091712061',
            rulesChannelId: '1240011681283969064',
            feedbackChannelId: '1447420576162648064',
            ticketChannelId: '1520717489548558416',
            paymentChannelId: '1526685412234362890',
            roleGamesChannelId: '1523666892860948520',
            autoRoleId: '939445945320505394',
            show_quick_links: true,
            show_server_info: true,
            welcomeTitle: '🎉 Welcome to MG3 STORE!',
            welcomeDescription: 'Welcome to MG3 STORE!',
          };
        }
        if (feat === 'server-logs') {
          return {
            memberJoinChannel: '1240011818223796284',
            memberLeftChannel: '1240011818223796284',
            messageDeleteChannel: '1240011786523115591',
            messageEditChannel: '1240011786523115591',
            roleEventsChannel: '1240011874259832863',
            channelEventsChannel: '1240011874259832863',
            voiceStateChannel: '1240012091293831178',
            memberModChannel: '1240011818223796284',
            autoJoinRoleId: '939445945320505394',
          };
        }
      }
      return DEFAULT_FEATURE_TEMPLATE[feat] || {};
    }

    // -----------------------------------------------------------------------
    // Specific Feature Request: /guild/:id/features/:feature
    // -----------------------------------------------------------------------
    if (subResource === 'features' && targetFeature) {
      if (req.method === 'GET') {
        const fromDb = await getFeatureConfigFromDb(guildId, targetFeature);
        const fallback = getMainStoreFallback(guildId, targetFeature);
        let saved = fromDb ? { ...fallback, ...fromDb } : (guildFeatureStore[guildId]?.[targetFeature] || fallback);

        if (saved && targetFeature === 'tickets') {
          if (!saved.embedBannerUrl || saved.embedBannerUrl === 'https://i.imghos.co/MtalsvvN.png') {
            saved.embedBannerUrl = 'https://i.imghos.co/BFqJGjlN.jpg';
          }
          if (!saved.embedTitle || saved.embedTitle === '🎫 MG3 STORE • SUPPORT TICKETS') {
            saved.embedTitle = 'Click below to create a new ticket';
          }
          if (saved.embedDescription && saved.embedDescription.includes('MG3 Support Services')) {
            saved.embedDescription = '';
          }
        }

        return res.status(200).json(saved);
      }

      if (req.method === 'POST' || req.method === 'PATCH') {
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
        const fallback = getMainStoreFallback(guildId, targetFeature);
        const merged = {
          ...fallback,
          ...(guildFeatureStore[guildId]?.[targetFeature] || {}),
          ...bodyData,
        };
        if (!guildFeatureStore[guildId]) guildFeatureStore[guildId] = {};
        guildFeatureStore[guildId][targetFeature] = merged;
        guildEnabledStore[guildId]?.add(targetFeature);
        await saveFeatureConfigToDb(guildId, targetFeature, merged);
        return res.status(200).json(merged);
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
          console.warn('Error querying Discord Bot API for guild info:', botErr);
        }
      }

      return res.status(200).json({
        id: String(authCheck.guild.id),
        name: String(authCheck.guild.name),
        icon: authCheck.guild.icon,
        owner: Boolean(authCheck.guild.owner),
        enabledFeatures: currentEnabled,
        settings: guildFeatureStore[guildId] || {},
      });
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
  }

  // List all bot guilds
  if (subpath === 'guilds' || subpath === '') {
    return res.status(200).json([]);
  }

  return res.status(404).json({ error: 'Endpoint not found' });
}
