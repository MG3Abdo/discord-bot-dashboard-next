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

/**
 * Used for custom forms
 * @returns Guild roles
 */
export async function fetchGuildRoles(session: AccessToken, guild: string): Promise<Role[]> {
  const result = await callReturn<any>(
    `/api/bot/guild/${guild}/roles`,
    botRequest(session, {
      request: {
        method: 'GET',
      },
    })
  );

  if (Array.isArray(result)) {
    return result;
  }
  if (result && Array.isArray(result.roles)) {
    return result.roles;
  }
  return [];
}

/**
 * @returns Guild channels
 */
export async function fetchGuildChannels(
  session: AccessToken,
  guild: string
): Promise<GuildChannel[]> {
  const result = await callReturn<any>(
    `/api/bot/guild/${guild}/channels`,
    botRequest(session, {
      request: {
        method: 'GET',
      },
    })
  );

  if (Array.isArray(result)) {
    return result;
  }
  if (result && Array.isArray(result.channels)) {
    return result.channels;
  }
  return [];
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
