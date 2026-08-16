import { Icon } from '@chakra-ui/react';
import {
  BsTicketDetailed,
  BsShieldCheck,
  BsPersonPlus,
} from 'react-icons/bs';
import {
  MdOutlineShoppingBag,
  MdAddReaction,
  MdCampaign,
  MdPayment,
  MdStarRate,
  MdLightbulb,
  MdBlock,
  MdMessage,
} from 'react-icons/md';
import { FeaturesConfig } from './types';
import { useTicketsFeature } from './features/TicketsFeature';
import { useServerLogsFeature } from './features/ServerLogsFeature';
import { useWelcomeFeature } from './features/WelcomeFeature';
import { useInviteLogFeature } from './features/InviteLogFeature';
import { useBlacklistFeature } from './features/BlacklistFeature';
import { useSuggestionsFeature } from './features/SuggestionsFeature';
import { useFeedbackFeature } from './features/FeedbackFeature';
import { useMarketingRequestsFeature } from './features/MarketingRequestsFeature';
import { useReactionRolesFeature } from './features/ReactionRolesFeature';
import { useSayFeature } from './features/SayFeature';
import { usePaymentFeature } from './features/PaymentFeature';

/**
 * 11 Actual MG3 Bot Features Config
 */
export const features: FeaturesConfig = {
  tickets: {
    name: 'Tickets System',
    description: 'Support tickets, categories, support roles, transcripts, and feedback.',
    icon: <Icon as={BsTicketDetailed} />,
    useRender: useTicketsFeature,
  },
  'server-logs': {
    name: 'Server Audit Logs',
    description: '19-event audit logger (joins, leaves, bans, kicks, message deletes/edits, roles, voice, timeouts).',
    icon: <Icon as={BsShieldCheck} />,
    useRender: useServerLogsFeature,
  },
  welcome: {
    name: 'Welcome & Quick Links',
    description: 'Custom welcome message on join with invite detection, quick links embed, and server counter.',
    icon: <Icon as={MdMessage} />,
    useRender: useWelcomeFeature,
  },
  'invite-log': {
    name: 'Invite Logger',
    description: 'Dedicated invite logger tracking who invited whom, total invites count, and account age.',
    icon: <Icon as={BsPersonPlus} />,
    useRender: useInviteLogFeature,
  },
  blacklist: {
    name: 'Blacklist Management',
    description: 'Restrict blacklisted users from creating tickets and posting order requests.',
    icon: <Icon as={MdBlock} />,
    useRender: useBlacklistFeature,
  },
  suggestions: {
    name: 'Suggestions System',
    description: 'Automatic suggestions embed generator with vote reactions, decision buttons, and logs.',
    icon: <Icon as={MdLightbulb} />,
    useRender: useSuggestionsFeature,
  },
  feedback: {
    name: 'Feedback & Reviews',
    description: 'Customer review submissions with 1-5 star ratings, modal forms, and automatic channel showcase.',
    icon: <Icon as={MdStarRate} />,
    useRender: useFeedbackFeature,
  },
  'marketing-requests': {
    name: 'Marketing & Order Requests',
    description: 'Convert user orders into structured request cards with Order IDs, staff pings, and delivery logs.',
    icon: <Icon as={MdOutlineShoppingBag} />,
    useRender: useMarketingRequestsFeature,
  },
  'reaction-roles': {
    name: 'Reaction Game Roles',
    description: 'Auto-assign gaming roles via message emoji reactions for 8 popular games.',
    icon: <Icon as={MdAddReaction} />,
    useRender: useReactionRolesFeature,
  },
  say: {
    name: 'Announcements & Broadcast (/say)',
    description: 'Send formatted stock and text announcements with buy buttons and role pings.',
    icon: <Icon as={MdCampaign} />,
    useRender: useSayFeature,
  },
  payment: {
    name: 'Payment Methods Panel',
    description: 'Display accepted payment methods (Vodafone Cash, Instapay, Binance, PayPal, USDT) in your server.',
    icon: <Icon as={MdPayment} />,
    useRender: usePaymentFeature,
  },
};
