import { logout } from '@/utils/auth/hooks';
import { callReturn } from '@/utils/fetch/core';

export type UserInfo = {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
};

export type Guild = {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
  owner?: boolean;
  isAdmin?: boolean;
  canManage?: boolean;
  features?: string[];
  hasBot?: boolean;
};

export type IconHash = string;

export enum PermissionFlags {
  CREATE_INSTANT_INVITE = 1 << 0,
  KICK_MEMBERS = 1 << 1,
  BAN_MEMBERS = 1 << 2,
  ADMINISTRATOR = 1 << 3,
  MANAGE_CHANNELS = 1 << 4,
  MANAGE_GUILD = 1 << 5,
  ADD_REACTIONS = 1 << 6,
  VIEW_AUDIT_LOG = 1 << 7,
  PRIORITY_SPEAKER = 1 << 8,
  STREAM = 1 << 9,
  VIEW_CHANNEL = 1 << 10,
  SEND_MESSAGES = 1 << 11,
  SEND_TTS_MESSAGES = 1 << 12,
  MANAGE_MESSAGES = 1 << 13,
  EMBED_LINKS = 1 << 14,
  ATTACH_FILES = 1 << 15,
  READ_MESSAGE_HISTORY = 1 << 16,
  MENTION_EVERYONE = 1 << 17,
  USE_EXTERNAL_EMOJIS = 1 << 18,
  VIEW_GUILD_INSIGHTS = 1 << 19,
  CONNECT = 1 << 20,
  SPEAK = 1 << 21,
  MUTE_MEMBERS = 1 << 22,
  DEAFEN_MEMBERS = 1 << 23,
  MOVE_MEMBERS = 1 << 24,
  USE_VAD = 1 << 25,
  CHANGE_NICKNAME = 1 << 26,
  MANAGE_NICKNAMES = 1 << 27,
  MANAGE_ROLES = 1 << 28,
  MANAGE_WEBHOOKS = 1 << 29,
  MANAGE_EMOJIS_AND_STICKERS = 1 << 30,
}

export enum ChannelTypes {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_ANNOUNCEMENT = 5,
  ANNOUNCEMENT_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
  GUILD_FORUM = 15,
}

/**
 * Check if the user has management permissions (Administrator or Manage Guild or Server Owner)
 * Uses 64-bit BigInt calculations to avoid JavaScript 32-bit bitwise truncation
 */
export function canManageGuild(guild: Guild): boolean {
  if (guild.owner) return true;
  if (guild.isAdmin || guild.canManage) return true;

  try {
    const perms = BigInt(guild.permissions || '0');
    // ADMINISTRATOR: 1n << 3n = 8
    // MANAGE_GUILD: 1n << 5n = 32
    const adminBit = BigInt(8);
    const manageBit = BigInt(32);
    const isAdmin = (perms & adminBit) === adminBit;
    const canManage = (perms & manageBit) === manageBit;
    return isAdmin || canManage;
  } catch {
    return false;
  }
}

/**
 * Fetch current user profile via server-side API proxy
 */
export async function fetchUserInfo(_accessToken?: string): Promise<UserInfo> {
  return await callReturn<UserInfo>('/api/user', {
    request: {
      method: 'GET',
    },
    allowed: {
      401: async () => {
        await logout();
        throw new Error('Not logged in');
      },
    },
  });
}

/**
 * Fetch current user guilds via server-side API proxy
 */
export async function getGuilds(_accessToken?: string): Promise<Guild[]> {
  return await callReturn<Guild[]>('/api/guilds', {
    request: {
      method: 'GET',
    },
    allowed: {
      401: async () => {
        await logout();
        throw new Error('Not logged in');
      },
    },
  });
}

export async function getGuild(_accessToken: string, id: string): Promise<Guild | undefined> {
  const guilds = await getGuilds();
  return guilds.find((g) => g.id === id);
}

export function iconUrl(guild: { id: string; icon?: string | null }): string | undefined {
  if (!guild.icon) return undefined;
  const isAnimated = guild.icon.startsWith('a_');
  const ext = isAnimated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=256`;
}

export function avatarUrl(user: {
  id: string;
  avatar?: string | null;
  discriminator?: string;
}): string {
  if (user.avatar) {
    const isAnimated = user.avatar.startsWith('a_');
    const ext = isAnimated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
  }

  // Discord Default Avatar
  if (!user.discriminator || user.discriminator === '0') {
    try {
      const shift22 = BigInt(22);
      const mod6 = BigInt(6);
      const index = Number((BigInt(user.id) >> shift22) % mod6);
      return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    } catch {
      return `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
  }

  const index = Number(user.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function bannerUrl(id: string, banner: string): string {
  const isAnimated = banner.startsWith('a_');
  const ext = isAnimated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/banners/${id}/${banner}.${ext}?size=1024`;
}
