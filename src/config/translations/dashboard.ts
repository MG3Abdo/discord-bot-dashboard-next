import { provider } from './provider';
import { createI18n } from '@/utils/i18n';

export const dashboard = createI18n(provider, {
  en: {
    hero: {
      title: 'MG3 Nexus Dashboard',
      description: 'Manage and configure your Discord servers with MG3 Nexus bot',
      invite_bn: 'Add Bot to Server',
      profile_bn: 'My Profile',
    },
    servers: {
      title: 'Select Server',
      description: 'Choose a server to configure features and manage settings',
      manage: 'Manage',
      no_servers: 'No Manageable Servers Found',
      no_servers_desc: 'You need Administrator permission in a Discord server to configure MG3 Nexus.',
      invite_prompt: 'Invite Bot to Server',
      try_again: 'Try Again',
    },
    features_overview: {
      title: 'Bot Features',
      welcome_title: 'Welcome System',
      welcome_desc: 'Customizable welcome messages, channels, and member greetings',
      roles_title: 'Roles & Permissions',
      roles_desc: 'Manage server roles, reaction roles, and automated assignments',
      commands_title: 'Commands & Utilities',
      commands_desc: 'Full suite of Discord slash commands and moderation tools',
    },
  },
  cn: {
    hero: {
      title: 'MG3 Nexus 控制面板',
      description: '使用 MG3 Nexus 機器人管理與配置您的 Discord 伺服器',
      invite_bn: '新增機器人到伺服器',
      profile_bn: '個人資料',
    },
    servers: {
      title: '選擇伺服器',
      description: '選擇伺服器以配置功能並管理設定',
      manage: '管理',
      no_servers: '未找到可管理的伺服器',
      no_servers_desc: '您需要伺服器的管理員權限才能使用 MG3 Nexus 進行管理。',
      invite_prompt: '邀請機器人到伺服器',
      try_again: '重試',
    },
    features_overview: {
      title: '機器人功能',
      welcome_title: '歡迎系統',
      welcome_desc: '自定義歡迎訊息、頻道與成員問候',
      roles_title: '身分組與權限',
      roles_desc: '管理伺服器身分組、反應身分組與自動分配',
      commands_title: '指令與工具',
      commands_desc: '完整的 Discord 斜線指令與管理工具',
    },
  },
});
