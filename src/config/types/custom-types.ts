/***
 * Custom types for MG3 Nexus Dashboard (11 Actual MG3 Bot Features)
 ***/

import { GuildInfo } from './types';

export type CustomGuildInfo = GuildInfo & {
  settings?: Record<string, any>;
};

/**
 * 11 Real MG3 Features
 */
export type CustomFeatures = {
  tickets: TicketsFeature;
  'server-logs': ServerLogsFeature;
  welcome: WelcomeFeature;
  'invite-log': InviteLogFeature;
  blacklist: BlacklistFeature;
  suggestions: SuggestionsFeature;
  feedback: FeedbackFeature;
  'marketing-requests': MarketingRequestsFeature;
  'reaction-roles': ReactionRolesFeature;
  say: SayFeature;
  payment: PaymentFeature;
};

// 1. Tickets System
export type TicketsFeature = {
  panelChannelId?: string;
  categoryId?: string;
  logChannelId?: string;
  supportRoleId?: string;
  ceoRoleId?: string;
  enableTranscripts?: boolean;
  enableDmFeedback?: boolean;
};

// 2. Server Logs
export type ServerLogsFeature = {
  memberJoinChannel?: string;
  memberLeftChannel?: string;
  messageDeleteChannel?: string;
  messageEditChannel?: string;
  roleEventsChannel?: string;
  channelEventsChannel?: string;
  voiceStateChannel?: string;
  memberModChannel?: string;
  autoJoinRoleId?: string;
};

// 3. Welcome & Quick Links
export type WelcomeFeature = {
  channelId?: string;
  welcomeChannelId?: string;
  message?: string;
  autoRoleId?: string;
  enableImage?: boolean;
  enableDm?: boolean;
  welcomeBannerUrl?: string;
  rulesChannelId?: string;
  ticketChannelId?: string;
  feedbackChannelId?: string;
  paymentChannelId?: string;
  roleGamesChannelId?: string;
  pingInviter?: boolean;
  showQuickLinks?: boolean;
  showServerInfo?: boolean;
};

// 4. Invite Logger
export type InviteLogFeature = {
  enabled?: boolean;
  inviteLogChannelId?: string;
};

// 5. Blacklist
export type BlacklistFeature = {
  blacklistRoleId?: string;
  ceoRoleId?: string;
  blockTickets?: boolean;
  deleteRequestMessages?: boolean;
};

// 6. Suggestions
export type SuggestionsFeature = {
  channelId?: string;
  suggestionsChannelId?: string;
  suggestionsLogChannelId?: string;
  staffRoleId?: string;
  enableThreads?: boolean;
  enableReactions?: boolean;
};

// 7. Feedback
export type FeedbackFeature = {
  channelId?: string;
  feedbackChannelId?: string;
  bannerUrl?: string;
  enableRatingStars?: boolean;
  enableComments?: boolean;
};

// 8. Marketing Requests
export type MarketingRequestsFeature = {
  requestChannelId?: string;
  logChannelId?: string;
  marketingRoleId?: string;
  leaderRoleId?: string;
  marketingLeaderRoleId?: string;
  logDoneChannelId?: string;
  logDeleteChannelId?: string;
};

export type MarketingFeature = MarketingRequestsFeature;

// 9. Reaction Roles
export type ReactionRolesFeature = {
  channelId?: string;
  messageId?: string;
  roleId?: string;
  emoji?: string;
  reactionRoleChannelId?: string;
  arcRaidersRoleId?: string;
  overwatchRoleId?: string;
  rocketLeagueRoleId?: string;
  marvelRivalsRoleId?: string;
  valorantRoleId?: string;
  codRoleId?: string;
  fcRoleId?: string;
  fivemRoleId?: string;
};

// 10. Say / Announcements
export type SayFeature = {
  defaultChannelId?: string;
  allowedRoleId?: string;
  enableEmbeds?: boolean;
  logChannelId?: string;
  buyButtonUrl?: string;
  otherPaymentButtonUrl?: string;
};

// 11. Payment Methods
export type PaymentFeature = {
  vodafoneCashNumber?: string;
  instapayUsername?: string;
  paypalEmail?: string;
  binanceId?: string;
  receiptLogChannelId?: string;
  enableAutoConfirm?: boolean;
  paymentChannelId?: string;
  acceptVodafoneCash?: boolean;
  acceptInstapay?: boolean;
  acceptBinance?: boolean;
  acceptPaypal?: boolean;
  acceptUsdt?: boolean;
  autoPin?: boolean;
};
