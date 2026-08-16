import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { InputForm } from '@/components/forms/InputForm';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { WelcomeFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useWelcomeFeature: UseFormRender<WelcomeFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<WelcomeFeature>({
    defaultValues: {
      welcomeChannelId: initial?.welcomeChannelId ?? '',
      welcomeBannerUrl: initial?.welcomeBannerUrl ?? '',
      rulesChannelId: initial?.rulesChannelId ?? '',
      ticketChannelId: initial?.ticketChannelId ?? '',
      feedbackChannelId: initial?.feedbackChannelId ?? '',
      paymentChannelId: initial?.paymentChannelId ?? '',
      roleGamesChannelId: initial?.roleGamesChannelId ?? '',
      pingInviter: initial?.pingInviter ?? false,
      showQuickLinks: initial?.showQuickLinks ?? true,
      showServerInfo: initial?.showServerInfo ?? true,
    },
  });

  const values = watch();

  const exportText = `// MG3 Welcome Configuration in config-guilds.js for: ${guild || 'GUILD_ID'}
'${guild || 'GUILD_ID'}': {
  WELCOME_CHANNEL_ID: '${values.welcomeChannelId || ''}',
  WELCOME_BANNER_URL: '${values.welcomeBannerUrl || 'https://i.imgur.com/dD187cK.png'}',
  RULES_CHANNEL_ID: '${values.rulesChannelId || ''}',
  TICKET_CHANNEL_ID: '${values.ticketChannelId || ''}',
  FEEDBACK_CHANNEL_ID: '${values.feedbackChannelId || ''}',
  PAYMENT_METHODS_CHANNEL_ID: '${values.paymentChannelId || ''}',
  ROLE_GAMES_CHANNEL_ID: '${values.roleGamesChannelId || ''}',
  PING_INVITER: ${values.pingInviter ? 'true' : 'false'},
  show_quick_links: ${values.showQuickLinks ? 'true' : 'false'},
  show_server_info: ${values.showServerInfo ? 'true' : 'false'}
}`;

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit((values) => onSubmit(JSON.stringify(values))),
    component: (
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Welcome Channel',
              description: 'Channel where welcome messages are sent.',
            }}
            controller={{ control, name: 'welcomeChannelId' }}
          />
          <InputForm
            control={{
              label: 'Welcome Banner URL',
              description: 'Image / GIF URL displayed in the welcome embed banner.',
            }}
            controller={{ control, name: 'welcomeBannerUrl' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Rules Channel',
              description: 'Quick link channel for server rules.',
            }}
            controller={{ control, name: 'rulesChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Tickets Channel',
              description: 'Quick link channel to open support tickets.',
            }}
            controller={{ control, name: 'ticketChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Feedback Channel',
              description: 'Quick link channel for customer reviews.',
            }}
            controller={{ control, name: 'feedbackChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Payment Methods Channel',
              description: 'Quick link channel for payment options.',
            }}
            controller={{ control, name: 'paymentChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Game Roles Channel',
              description: 'Quick link channel for game reaction roles.',
            }}
            controller={{ control, name: 'roleGamesChannelId' }}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Ping Inviter',
              description: 'Tag the inviter when a new member joins.',
            }}
            controller={{ control, name: 'pingInviter' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Show Quick Links',
              description: 'Include the Quick Links section in welcome embed.',
            }}
            controller={{ control, name: 'showQuickLinks' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Show Server Info',
              description: 'Show member count and inviter details.',
            }}
            controller={{ control, name: 'showServerInfo' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Welcome Configuration"
          description="Guild configuration block for config-guilds.js."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
