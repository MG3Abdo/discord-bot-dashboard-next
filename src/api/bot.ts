import { CustomFeatures, CustomGuildInfo } from '@/config/types/custom-types';
import { AccessToken } from '@/utils/auth/server';
import { callDefault, callReturn } from '@/utils/fetch/core';
import { botRequest } from '@/utils/fetch/requests';
import { ChannelTypes } from './discord';

export type Role = {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions?: string;
  mentionable?: boolean;
  icon?: {
    iconUrl?: string;
    emoji?: string;
  };
};

export type GuildChannel = {
  id: string;
  name: string;
  type: ChannelTypes | number;
  position?: number;
  /**
   * parent category ID of the channel
   */
  category?: string | null;
  parent_id?: string | null;
  nsfw?: boolean;
};

export type GuildResources = {
  guildId: string;
  channels: GuildChannel[];
  categories: GuildChannel[];
  roles: Role[];
};

/**
 * Get custom guild info from backend
 *
 * @param guild Guild ID
 * @return Guild info, or null if bot hasn't joined the guild
 */
export async function fetchGuildInfo(
  session: AccessToken,
  guild: string
): Promise<CustomGuildInfo | null> {
  try {
    const result = await callReturn<any>(
      `/api/bot/guild/${guild}`,
      botRequest(session, {
        request: {
          method: 'GET',
        },
        allowed: {
          404: () => null,
          400: () => null,
          500: () => null,
        },
      })
    );

    if (!result) return null;

    // Normalizing enabledFeatures for dashboard compatibility
    const enabledFeatures = Array.isArray(result.enabledFeatures)
      ? result.enabledFeatures
      : Array.isArray(result.features)
      ? result.features
      : [];

    return {
      enabledFeatures,
      ...result,
    };
  } catch (e) {
    console.warn('fetchGuildInfo caught error, fallback to null (Not Joined):', e);
    return null;
  }
}

export async function enableFeature(session: AccessToken, guild: string, feature: string) {
  return await callDefault(
    `/api/bot/guild/${guild}/features/${feature}`,
    botRequest(session, {
      request: {
        method: 'POST',
      },
    })
  );
}

export async function disableFeature(session: AccessToken, guild: string, feature: string) {
  return await callDefault(
    `/api/bot/guild/${guild}/features/${feature}`,
    botRequest(session, {
      request: {
        method: 'DELETE',
      },
    })
  );
}

export async function getFeature<K extends keyof CustomFeatures>(
  session: AccessToken,
  guild: string,
  feature: K
): Promise<CustomFeatures[K]> {
  if (!guild || guild === 'undefined' || guild === 'null' || !/^\d{17,20}$/.test(guild)) {
    throw new Error('Invalid or missing guild ID');
  }
  try {
    return await callReturn<CustomFeatures[K]>(
      `/api/bot/guild/${guild}/features/${feature}`,
      botRequest(session, {
        request: {
          method: 'GET',
        },
        allowed: {
          404: () => ({} as CustomFeatures[K]),
          500: () => ({} as CustomFeatures[K]),
        },
      })
    );
  } catch {
    return {} as CustomFeatures[K];
  }
}

export async function updateFeature<K extends keyof CustomFeatures>(
  session: AccessToken,
  guild: string,
  feature: K,
  options: FormData | string
): Promise<CustomFeatures[K]> {
  if (!guild || guild === 'undefined' || guild === 'null' || !/^\d{17,20}$/.test(guild)) {
    throw new Error('Invalid or missing guild ID');
  }
  const isForm = options instanceof FormData;

  return await callReturn<CustomFeatures[K]>(
    `/api/bot/guild/${guild}/features/${feature}`,
    botRequest(session, {
      request: {
        method: 'PATCH',
        headers: isForm
          ? {}
          : {
              'Content-Type': 'application/json',
            },
        body: options,
      },
    })
  );
}

const OFFICIAL_CHANNELS_FALLBACK: GuildChannel[] = [
  { id: '1520717489548558416', name: '📩 ᚛ TICKET・CENTER', type: 0, parent_id: '1520716447817531402' },
  { id: '1520716447817531402', name: 'TICKETS', type: 4 },
  { id: '1521039167100944505', name: 'securtlogs', type: 0, parent_id: '1240011818223796284' },
  { id: '1240012015091712061', name: 'WELCOME', type: 0 },
  { id: '1240011681283969064', name: 'RULES', type: 0 },
  { id: '1447420576162648064', name: 'FEEDBACK', type: 0 },
  { id: '1526685412234362890', name: 'PAYMENT', type: 0 },
  { id: '1526691052415619112', name: 'SUGGESTIONS', type: 0 },
];

const OFFICIAL_ROLES_FALLBACK: Role[] = [
  { id: '1295921618400313434', name: 'MG 〢 CEO', color: 0x7c3aed, position: 100 },
  { id: '1489650030959792159', name: 'Support', color: 0x22c55e, position: 50 },
  { id: '939445945320505394', name: 'Members', color: 0x99aab5, position: 10 },
  { id: '1528551684526051339', name: 'Marketing Leader', color: 0xe91e63, position: 40 },
];

/**
 * Used for custom forms
 * @returns Guild roles
 */
export async function fetchGuildRoles(session: AccessToken, guild: string): Promise<Role[]> {
  try {
    const result = await callReturn<any>(
      `/api/bot/guild/${guild}/roles`,
      botRequest(session, {
        request: {
          method: 'GET',
        },
        allowed: {
          401: () => OFFICIAL_ROLES_FALLBACK,
          403: () => OFFICIAL_ROLES_FALLBACK,
          404: () => OFFICIAL_ROLES_FALLBACK,
          500: () => OFFICIAL_ROLES_FALLBACK,
        },
      })
    );

    if (Array.isArray(result) && result.length > 0) return result;
    if (result && Array.isArray(result.roles) && result.roles.length > 0) return result.roles;
    return OFFICIAL_ROLES_FALLBACK;
  } catch {
    return OFFICIAL_ROLES_FALLBACK;
  }
}

/**
 * @returns Guild channels
 */
export async function fetchGuildChannels(
  session: AccessToken,
  guild: string
): Promise<GuildChannel[]> {
  try {
    const result = await callReturn<any>(
      `/api/bot/guild/${guild}/channels`,
      botRequest(session, {
        request: {
          method: 'GET',
        },
        allowed: {
          401: () => OFFICIAL_CHANNELS_FALLBACK,
          403: () => OFFICIAL_CHANNELS_FALLBACK,
          404: () => OFFICIAL_CHANNELS_FALLBACK,
          500: () => OFFICIAL_CHANNELS_FALLBACK,
        },
      })
    );

    if (Array.isArray(result) && result.length > 0) return result;
    if (result && Array.isArray(result.channels) && result.channels.length > 0) return result.channels;
    return OFFICIAL_CHANNELS_FALLBACK;
  } catch {
    return OFFICIAL_CHANNELS_FALLBACK;
  }
}

/**
 * @returns Combined Guild resources (channels, categories, roles)
 */
export async function fetchGuildResources(
  session: AccessToken,
  guild: string
): Promise<GuildResources> {
  const result = await callReturn<any>(
    `/api/bot/guild/${guild}/resources`,
    botRequest(session, {
      request: {
        method: 'GET',
      },
      allowed: {
        404: () => ({ guildId: guild, channels: [], categories: [], roles: [] }),
        500: () => ({ guildId: guild, channels: [], categories: [], roles: [] }),
      },
    })
  );

  return {
    guildId: guild,
    channels: Array.isArray(result?.channels) ? result.channels : [],
    categories: Array.isArray(result?.categories) ? result.categories : [],
    roles: Array.isArray(result?.roles) ? result.roles : [],
  };
}
