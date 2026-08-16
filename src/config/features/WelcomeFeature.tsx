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
        'Welcome {user} to **{server}**!\nYou are member #{members}.\n\n✦ Please read the server rules\n✦ Check game roles to unlock channels\n✦ Open a ticket if you need any help!',
      welcomeColor: initial?.welcomeColor ?? '#7c3aed',
      welcomeBannerUrl: initial?.welcomeBannerUrl ?? 'https://i.imghos.co/ntfWXhwt.png',
      autoRoleId: initial?.autoRoleId ?? '',
      botAutoRoleId: initial?.botAutoRoleId ?? '',
      enableImage: initial?.enableImage ?? true,
      enableDm: initial?.enableDm ?? false,
      dmMessage: initial?.dmMessage ?? 'Welcome {user} to {server}! Thanks for joining our community.',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? initial.welcomeChannelId ?? '',
        welcomeTitle: initial.welcomeTitle ?? '🎉 Welcome to {server}!',
        welcomeDescription:
          initial.welcomeDescription ??
          'Welcome {user} to **{server}**!\nYou are member #{members}.\n\n✦ Please read the server rules\n✦ Check game roles to unlock channels\n✦ Open a ticket if you need any help!',
        welcomeColor: initial.welcomeColor ?? '#7c3aed',
        welcomeBannerUrl: initial.welcomeBannerUrl ?? 'https://i.imghos.co/ntfWXhwt.png',
        autoRoleId: initial.autoRoleId ?? '',
        botAutoRoleId: initial.botAutoRoleId ?? '',
        enableImage: initial.enableImage ?? true,
        enableDm: initial.enableDm ?? false,
        dmMessage: initial.dmMessage ?? 'Welcome {user} to {server}! Thanks for joining our community.',
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
  WELCOME_TITLE: '${values.welcomeTitle || '🎉 Welcome to {server}!'}',
  WELCOME_DESCRIPTION: '${(values.welcomeDescription || '').replace(/\n/g, ' ')}',
  WELCOME_COLOR: '${values.welcomeColor || '#7c3aed'}',
  WELCOME_BANNER_URL: '${values.welcomeBannerUrl || ''}',
  ENABLE_WELCOME_IMAGE: ${values.enableImage ? 'true' : 'false'},
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
              description: 'Channel where welcome embeds and cards are posted.',
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

        {/* Custom Welcome Embed Designer (Premium) */}
        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading fontSize="md" fontWeight="600" mb={1} color="purple.300">
            🎨 Custom Welcome Embed Designer (ProBot Style)
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
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Welcome Banner Image URL',
                description: 'Large animated/static banner image displayed on join.',
              }}
              controller={{ control, name: 'welcomeBannerUrl' }}
            />
          </Box>
        </Box>

        {/* DM and Canvas Image Settings */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Welcome Card Banner Image',
              description: 'Generate dynamic canvas welcome card image.',
            }}
            controller={{ control, name: 'enableImage' }}
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
