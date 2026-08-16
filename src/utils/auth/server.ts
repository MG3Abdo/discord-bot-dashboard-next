import { deleteCookie, setCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { OptionsType } from 'cookies-next/lib/types';
import type { IncomingMessage } from 'http';

export const API_ENDPOINT = 'https://discord.com/api/v10';
export const CLIENT_ID =
  process.env.BOT_CLIENT_ID ??
  process.env.DISCORD_CLIENT_ID ??
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ??
  '';
export const CLIENT_SECRET =
  process.env.BOT_CLIENT_SECRET ??
  process.env.DISCORD_CLIENT_SECRET ??
  '';

export const TokenCookie = 'ts-token';

export const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

export type AccessToken = z.infer<typeof tokenSchema>;

const cookieOptions: OptionsType = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export function parseTokenData(raw: unknown): AccessToken | null {
  if (!raw) return null;
  if (typeof raw === 'object' && raw !== null) {
    const parsed = tokenSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  }
  if (typeof raw === 'string') {
    try {
      const parsedJson = JSON.parse(raw);
      const res = tokenSchema.safeParse(parsedJson);
      if (res.success) return res.data;
    } catch {
      // Try url decoded parse
      try {
        const decoded = decodeURIComponent(raw);
        const parsedJson = JSON.parse(decoded);
        const res = tokenSchema.safeParse(parsedJson);
        if (res.success) return res.data;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function middleware_hasServerSession(req: NextRequest): boolean {
  const raw = req.cookies.get(TokenCookie)?.value;
  return parseTokenData(raw) != null;
}

export function getServerSession(
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  }
): { success: true; data: AccessToken } | { success: false; data?: undefined } {
  const raw = req.cookies?.[TokenCookie];
  const data = parseTokenData(raw);
  if (data != null) {
    return { success: true, data };
  }
  return { success: false };
}

export function setServerSession(req: NextApiRequest, res: NextApiResponse, data: AccessToken) {
  setCookie(TokenCookie, JSON.stringify(data), { req, res, ...cookieOptions });
}

export async function removeSession(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (session.success) {
    deleteCookie(TokenCookie, { req, res, ...cookieOptions });
    await revokeToken(session.data.access_token);
  }
}

async function revokeToken(accessToken: string) {
  if (!CLIENT_ID || !CLIENT_SECRET || !accessToken) return;

  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    token: accessToken,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    await fetch(`https://discord.com/api/oauth2/token/revoke`, {
      headers,
      body: new URLSearchParams(data),
      method: 'POST',
    });
  } catch {
    // Ignore revocation network errors
  }
}
