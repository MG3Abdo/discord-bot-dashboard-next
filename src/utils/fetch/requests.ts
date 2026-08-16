import { deepmerge } from 'deepmerge-ts';
import { AccessToken } from '@/utils/auth/server';
import { Options, ReturnOptions } from './core';

// In Next.js client environment, use relative same-origin routing to hit our server-side API proxy
const bot_api_endpoint = '';
const discord_api_endpoint = '';

export function botRequest<T extends Options | ReturnOptions<any>>(session: AccessToken, options: T): T {
  return {
    ...options,
    origin: bot_api_endpoint,
    request: deepmerge(
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${session?.token_type || 'Bearer'} ${session?.access_token || ''}`,
        },
      },
      options.request
    ),
  };
}

export function discordRequest<T extends Options | ReturnOptions<any>>(accessToken: string, options: T): T {
  return {
    ...options,
    origin: discord_api_endpoint,
    request: deepmerge(
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      options.request
    ),
  };
}
