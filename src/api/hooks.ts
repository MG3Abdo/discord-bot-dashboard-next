import { CustomFeatures, CustomGuildInfo } from '../config/types';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { UserInfo, Guild, getGuild, getGuilds, fetchUserInfo } from '@/api/discord';
import {
  disableFeature,
  enableFeature,
  fetchGuildChannels,
  fetchGuildInfo,
  fetchGuildRoles,
  getFeature,
  updateFeature,
} from '@/api/bot';
import { GuildInfo } from '@/config/types';
import { useAccessToken, useSession } from '@/utils/auth/hooks';

export const client = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export const Keys = {
  login: ['login'],
  guild_info: (guild: string) => ['guild_info', guild],
  features: (guild: string, feature: string) => ['feature', guild, feature],
  guildRoles: (guild: string) => ['guild_roles', guild],
  guildChannels: (guild: string) => ['guild_channel', guild],
};

export const Mutations = {
  updateFeature: (guild: string, id: string) => ['feature', guild, id],
};

export function useGuild(id: string) {
  const { status } = useSession();

  return useQuery(['guild', id], () => getGuild('', id), {
    enabled: status === 'authenticated' && Boolean(id) && id !== 'undefined',
  });
}

export function useGuilds() {
  const { status } = useSession();

  return useQuery<Guild[]>(['user_guilds'], () => getGuilds(), {
    enabled: status === 'authenticated',
    staleTime: 60 * 1000,
  });
}

export function useSelfUserQuery() {
  const { status } = useSession();

  return useQuery<UserInfo>(['users', 'me'], () => fetchUserInfo(), {
    enabled: status === 'authenticated',
    staleTime: 60 * 1000,
  });
}

export function useGuildInfoQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery<CustomGuildInfo | null>(
    Keys.guild_info(guild),
    () => fetchGuildInfo(session!, guild),
    {
      enabled: status === 'authenticated' && Boolean(guild) && guild !== 'undefined',
      refetchOnWindowFocus: true,
      retry: false,
      staleTime: 0,
    }
  );
}

export function useFeatureQuery<K extends keyof CustomFeatures>(guild: string, feature: K) {
  const { status, session } = useSession();

  return useQuery(Keys.features(guild, feature), () => getFeature(session!, guild, feature), {
    enabled: status === 'authenticated' && Boolean(guild) && guild !== 'undefined',
  });
}

export type EnableFeatureOptions = { guild: string; feature: string; enabled: boolean };
export function useEnableFeatureMutation() {
  const { session } = useSession();

  return useMutation(
    async ({ enabled, guild, feature }: EnableFeatureOptions) => {
      if (enabled) return enableFeature(session!, guild, feature);
      return disableFeature(session!, guild, feature);
    },
    {
      async onSuccess(_, { guild, feature, enabled }) {
        await client.invalidateQueries(Keys.features(guild, feature));
        client.setQueryData<GuildInfo | null>(Keys.guild_info(guild), (prev) => {
          if (prev == null) return null;

          if (enabled) {
            return {
              ...prev,
              enabledFeatures: prev.enabledFeatures.includes(feature)
                ? prev.enabledFeatures
                : [...prev.enabledFeatures, feature],
            };
          } else {
            return {
              ...prev,
              enabledFeatures: prev.enabledFeatures.filter((f) => f !== feature),
            };
          }
        });
      },
    }
  );
}

export type UpdateFeatureOptions = {
  guild: string;
  feature: keyof CustomFeatures;
  options: FormData | string;
};
export function useUpdateFeatureMutation() {
  const { session } = useSession();

  return useMutation(
    (options: UpdateFeatureOptions) =>
      updateFeature(session!, options.guild, options.feature, options.options),
    {
      onSuccess(updated, options) {
        const key = Keys.features(options.guild, options.feature);

        return client.setQueryData(key, updated);
      },
    }
  );
}

export function useGuildRolesQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(
    Keys.guildRoles(guild),
    () => fetchGuildRoles(session!, guild),
    {
      enabled: status === 'authenticated' && Boolean(guild) && guild !== 'undefined',
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    }
  );
}

export function useGuildChannelsQuery(guild: string) {
  const { status, session } = useSession();

  return useQuery(
    Keys.guildChannels(guild),
    () => fetchGuildChannels(session!, guild),
    {
      enabled: status === 'authenticated' && Boolean(guild) && guild !== 'undefined',
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    }
  );
}

export function useSelfUser(): UserInfo | undefined {
  return useSelfUserQuery().data;
}

export function useGuildPreview(guild: string) {
  const query = useGuilds();

  return {
    guild: query.data?.find((g) => g.id === guild),
    query,
  };
}
