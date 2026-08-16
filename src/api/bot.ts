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
  icon?: {
    iconUrl?: string;
    emoji?: string;
  };
};

export type GuildChannel = {
  id: string;
  name: string;
  type: ChannelTypes;
  /**
   * parent category of the channel
   */
  category?: string;
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
      : result.settings?.welcome
      ? ['welcome-message']
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
  try {
    return await callDefault(
      `/api/bot/guild/${guild}/features/${feature}`,
      botRequest(session, {
        request: {
          method: 'POST',
        },
        allowed: {
          404: () => null,
        },
      })
    );
  } catch (e) {
    console.warn('enableFeature error:', e);
  }
}

export async function disableFeature(session: AccessToken, guild: string, feature: string) {
  try {
    return await callDefault(
      `/api/bot/guild/${guild}/features/${feature}`,
      botRequest(session, {
        request: {
          method: 'DELETE',
        },
        allowed: {
          404: () => null,
        },
      })
    );
  } catch (e) {
    console.warn('disableFeature error:', e);
  }
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

  try {
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

/**
 * Used for custom forms
 * @returns Guild roles
 */
export async function fetchGuildRoles(session: AccessToken, guild: string): Promise<Role[]> {
  try {
    return await callReturn<Role[]>(
      `/api/bot/guild/${guild}/roles`,
      botRequest(session, {
        request: {
          method: 'GET',
        },
        allowed: {
          404: () => [],
          500: () => [],
        },
      })
    );
  } catch {
    return [];
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
    return await callReturn<GuildChannel[]>(
      `/api/bot/guild/${guild}/channels`,
      botRequest(session, {
        request: {
          method: 'GET',
        },
        allowed: {
          404: () => [],
          500: () => [],
        },
      })
    );
  } catch {
    return [];
  }
}
