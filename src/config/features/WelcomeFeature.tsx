import { SimpleGrid, VStack, Box, Heading, Text } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { InputForm } from '@/components/forms/InputForm';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { WelcomeFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useWelcomeFeature: UseFormRender<WelcomeFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<WelcomeFeature>({
    defaultValues: {
      channelId: initial?.channelId ?? initial?.welcomeChannelId ?? '',
      welcomeTitle: initial?.welcomeTitle ?? '🎉 Welcome to {server}!',
      welcomeDescription:
        initial?.welcomeDescription ??
        '<a:1_:1538877031465488485> **Welcome** {user} **to** `{server}` <a:redheart:1538877755507089558>',
      welcomeColor: initial?.welcomeColor ?? '#7c3aed',
      welcomeBannerUrl: initial?.welcomeBannerUrl ?? '',
      footerIconUrl:
        initial?.footerIconUrl ??
        'https://i.postimg.cc/XJ2QrWQW/37896d8b04703ee4b064e61b1af02fed.webp',
      footerText: initial?.footerText ?? 'Enjoy your stay in {server}',
      autoRoleId: initial?.autoRoleId ?? '',
      botAutoRoleId: initial?.botAutoRoleId ?? '',
      enableImage: initial?.enableImage ?? true,
      enableDm: initial?.enableDm ?? false,
      dmMessage: initial?.dmMessage ?? 'Welcome {user} to {server}! Thanks for joining our community.',
      rulesChannelId: initial?.rulesChannelId ?? '',
      ticketChannelId: initial?.ticketChannelId ?? '',
      feedbackChannelId: initial?.feedbackChannelId ?? '',
      paymentChannelId: initial?.paymentChannelId ?? '',
      roleGamesChannelId: initial?.roleGamesChannelId ?? '',
      showQuickLinks: initial?.showQuickLinks ?? true,
      showServerInfo: initial?.showServerInfo ?? true,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? initial.welcomeChannelId ?? '',
        welcomeTitle: initial.welcomeTitle ?? '🎉 Welcome to {server}!',
        welcomeDescription:
          initial.welcomeDescription ??
          '<a:1_:1538877031465488485> **Welcome** {user} **to** `{server}` <a:redheart:1538877755507089558>',
        welcomeColor: initial.welcomeColor ?? '#7c3aed',
        welcomeBannerUrl: initial.welcomeBannerUrl ?? '',
        footerIconUrl:
          initial.footerIconUrl ??
          'https://i.postimg.cc/XJ2QrWQW/37896d8b04703ee4b064e61b1af02fed.webp',
        footerText: initial.footerText ?? 'Enjoy your stay in {server}',
        autoRoleId: initial.autoRoleId ?? '',
        botAutoRoleId: initial.botAutoRoleId ?? '',
        enableImage: initial.enableImage ?? true,
        enableDm: initial.enableDm ?? false,
        dmMessage: initial.dmMessage ?? 'Welcome {user} to {server}! Thanks for joining our community.',
        rulesChannelId: initial.rulesChannelId ?? '',
        ticketChannelId: initial.ticketChannelId ?? '',
        feedbackChannelId: initial.feedbackChannelId ?? '',
        paymentChannelId: initial.paymentChannelId ?? '',
        roleGamesChannelId: initial.roleGamesChannelId ?? '',
        showQuickLinks: initial.showQuickLinks ?? true,
        showServerInfo: initial.showServerInfo ?? true,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Welcome & Auto-Roles Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  GUILD_ID: '${guild || 'GUILD_ID'}',
  WELCOME_CHANNEL_ID: '${values.channelId || ''}',
  AUTO_ROLE_ID: '${values.autoRoleId || ''}',
  BOT_AUTO_ROLE_ID: '${values.botAutoRoleId || ''}',
  RULES_CHANNEL_ID: '${values.rulesChannelId || ''}',
  TICKET_CHANNEL_ID: '${values.ticketChannelId || ''}',
  FEEDBACK_CHANNEL_ID: '${values.feedbackChannelId || ''}',
  PAYMENT_CHANNEL_ID: '${values.paymentChannelId || ''}',
  ROLE_GAMES_CHANNEL_ID: '${values.roleGamesChannelId || ''}',
  WELCOME_TITLE: '${values.welcomeTitle || '🎉 Welcome to {server}!'}',
  WELCOME_DESCRIPTION: '${(values.welcomeDescription || '').replace(/\n/g, ' ')}',
  WELCOME_COLOR: '${values.welcomeColor || '#7c3aed'}',
  FOOTER_ICON_URL: '${values.footerIconUrl || ''}',
  FOOTER_TEXT: '${values.footerText || ''}',
  ENABLE_WELCOME_DM: ${values.enableDm ? 'true' : 'false'},
  DM_MESSAGE: '${(values.dmMessage || '').replace(/\n/g, ' ')}'
};`;

  const onFormSubmit = async (data: WelcomeFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={5} align="stretch">
        {/* Core Channel & Dual Auto-Role Setup */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Welcome Channel',
              description: 'Channel where welcome embeds are posted.',
            }}
            controller={{ control, name: 'channelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Member Auto-Role',
              description: 'Role given automatically to human members on join.',
            }}
            controller={{ control, name: 'autoRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Bot Auto-Role',
              description: 'Role given automatically to newly invited Bots.',
            }}
            controller={{ control, name: 'botAutoRoleId' }}
          />
        </SimpleGrid>

        {/* Quick Links Configuration */}
        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading fontSize="md" fontWeight="600" mb={1} color="purple.300">
            🔗 Quick Links Channels (Custom Point Emojis)
          </Heading>
          <Text fontSize="xs" color="TextSecondary" mb={4}>
            Configure the channels linked in the welcome embed (Rules, Feedback, Tickets, etc.)
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <ChannelSelectForm
              control={{
                label: 'Rules Channel',
                description: 'Channel for server rules.',
              }}
              controller={{ control, name: 'rulesChannelId' }}
            />
            <ChannelSelectForm
              control={{
                label: 'Feedback Channel',
                description: 'Channel for customer reviews.',
              }}
              controller={{ control, name: 'feedbackChannelId' }}
            />
            <ChannelSelectForm
              control={{
                label: 'Open Ticket Channel',
                description: 'Channel for support tickets.',
              }}
              controller={{ control, name: 'ticketChannelId' }}
            />
            <ChannelSelectForm
              control={{
                label: 'Payment Methods Channel',
                description: 'Channel for store payment methods (optional).',
              }}
              controller={{ control, name: 'paymentChannelId' }}
            />
            <ChannelSelectForm
              control={{
                label: 'Role Games Channel',
                description: 'Channel for reaction roles / game roles (optional).',
              }}
              controller={{ control, name: 'roleGamesChannelId' }}
            />
          </SimpleGrid>
        </Box>

        {/* Custom Welcome Embed Designer */}
        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading fontSize="md" fontWeight="600" mb={1} color="purple.300">
            🎨 Custom Welcome Embed Designer
          </Heading>
          <Text fontSize="xs" color="TextSecondary" mb={4}>
            Supports dynamic placeholders: <code>{'{user}'}</code>, <code>{'{server}'}</code>, <code>{'{members}'}</code>
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <InputForm
              control={{
                label: 'Welcome Embed Title',
                description: 'Main header title of the welcome card.',
              }}
              controller={{ control, name: 'welcomeTitle' }}
            />
            <InputForm
              control={{
                label: 'Embed Color (HEX)',
                description: 'Hex color for the Discord embed sidebar (e.g. #7c3aed).',
              }}
              controller={{ control, name: 'welcomeColor' }}
            />
          </SimpleGrid>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Welcome Embed Message Body',
                description: 'Custom rich text message sent to new members in channel.',
              }}
              controller={{ control, name: 'welcomeDescription' }}
            />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mt={4}>
            <InputForm
              control={{
                label: 'Footer Text',
                description: 'Text shown at bottom (e.g. Enjoy your stay in {server}).',
              }}
              controller={{ control, name: 'footerText' }}
            />
            <InputForm
              control={{
                label: 'Footer Icon URL (Small Image)',
                description: 'Small icon URL displayed next to the footer text.',
              }}
              controller={{ control, name: 'footerIconUrl' }}
            />
          </SimpleGrid>
        </Box>

        {/* DM and Canvas Image Settings */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Show Quick Links in Welcome',
              description: 'Include the Quick Links section in the welcome embed.',
            }}
            controller={{ control, name: 'showQuickLinks' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Send Welcome DM',
              description: 'Send direct message to new member upon joining.',
            }}
            controller={{ control, name: 'enableDm' }}
          />
        </SimpleGrid>

        {values.enableDm && (
          <Box p={4} bg="blackAlpha.400" rounded="xl" border="1px solid" borderColor="whiteAlpha.100">
            <InputForm
              control={{
                label: 'Direct Message (DM) Content',
                description: 'Private message sent to the member’s DMs on join.',
              }}
              controller={{ control, name: 'dmMessage' }}
            />
          </Box>
        )}

        <ConfigExportCard
          title="Export Welcome Configuration"
          description="Guild-specific welcome system configuration snippet."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
