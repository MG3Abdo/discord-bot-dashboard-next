import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from '@/utils/auth/server';

const BOT_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BOT_API_URL ||
  '';

const DASHBOARD_API_TOKEN = process.env.DASHBOARD_API_TOKEN || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (!session.success || !session.data?.access_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { path } = req.query as { path?: string[] };
  const subpath = Array.isArray(path) ? path.join('/') : path || '';

  // If external bot backend URL is configured
  if (BOT_API_URL && !BOT_API_URL.includes('localhost:8080')) {
    try {
      const normalizedBase = BOT_API_URL.endsWith('/')
        ? BOT_API_URL.slice(0, -1)
        : BOT_API_URL;

      // Construct target URL
      // If target already has /api/bot or not
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

      if (!botRes.ok) {
        const errText = await botRes.text().catch(() => '');
        console.warn(`Bot API returned status ${botRes.status}:`, errText);
        return res.status(botRes.status).json({ error: 'Bot API error', details: errText });
      }

      const data = await botRes.json();
      return res.status(200).json(data);
    } catch (err: any) {
      console.warn('Could not forward request to external Bot API:', err?.message || err);
      // Fall through to default fallback handlers
    }
  }

  // Standalone / Fallback behavior when external bot backend is not reached
  // 1. GET guild info: /guild/:id or /guilds/:id
  if (subpath.startsWith('guild/') || subpath.startsWith('guilds/')) {
    const parts = subpath.split('/');
    const guildId = parts[1];

    if (req.method === 'GET' && parts.length === 2) {
      // Return 404 indicating bot is not in the guild (or offline) so UI displays the "Invite Bot" state
      return res.status(404).json({ error: 'Bot not joined in this guild', guildId });
    }

    if (req.method === 'GET' && parts[2] === 'roles') {
      return res.status(200).json([]);
    }

    if (req.method === 'GET' && parts[2] === 'channels') {
      return res.status(200).json([]);
    }

    if (req.method === 'GET' && parts[2] === 'features') {
      return res.status(200).json({});
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
      return res.status(200).json({ success: true });
    }
  }

  // 2. GET all bot guilds: /guilds
  if (subpath === 'guilds' || subpath === '') {
    return res.status(200).json([]);
  }

  return res.status(404).json({ error: 'Not found' });
}
