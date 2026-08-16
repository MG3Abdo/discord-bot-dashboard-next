import { NextApiRequest, NextApiResponse } from 'next';
import {
  AccessToken,
  API_ENDPOINT,
  CLIENT_ID,
  CLIENT_SECRET,
  setServerSession,
} from '@/utils/auth/server';
import { i18n } from 'next.config';
import { z } from 'zod';
import { getAbsoluteUrl } from '@/utils/get-absolute-url';

async function exchangeToken(code: string): Promise<AccessToken> {
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI || `${getAbsoluteUrl()}/api/auth/callback`;

  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const response = await fetch(`${API_ENDPOINT}/oauth2/token`, {
    headers,
    method: 'POST',
    body: new URLSearchParams(data),
  });

  if (response.ok) {
    return (await response.json()) as AccessToken;
  } else {
    const errorText = await response.text().catch(() => '');
    console.error('Failed to exchange token with Discord:', response.status, errorText);
    throw new Error(`Failed to exchange token: ${response.status}`);
  }
}

const querySchema = z.object({
  code: z.string(),
  state: z
    .string()
    .optional()
    // Handle unsupported locales
    .transform((v) => {
      if (i18n == null || v == null || v === '') return undefined;

      return i18n.locales.find((locale) => locale === v);
    }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).json({ error: 'Invalid query param' });
  }

  const { code, state } = query.data;

  try {
    const token = await exchangeToken(code);
    setServerSession(req, res, token);
    const destination = state ? `/${state}/user/home` : `/user/home`;
    res.redirect(destination);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.redirect(`/auth/signin?error=oauth_failed`);
  }
}
