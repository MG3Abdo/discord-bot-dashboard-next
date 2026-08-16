import { SimpleGrid, VStack, Box, Heading, Text } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { CategorySelectForm } from '@/components/forms/CategorySelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { InputForm } from '@/components/forms/InputForm';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { TicketsFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useTicketsFeature: UseFormRender<TicketsFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<TicketsFeature>({
    defaultValues: {
      panelChannelId: initial?.panelChannelId ?? '',
      categoryId: initial?.categoryId ?? '',
      logChannelId: initial?.logChannelId ?? '',
      supportRoleId: initial?.supportRoleId ?? '',
      ceoRoleId: initial?.ceoRoleId ?? '',
      enableTranscripts: initial?.enableTranscripts ?? true,
      enableDmFeedback: initial?.enableDmFeedback ?? true,
      embedTitle: initial?.embedTitle ?? '🎫 MG3 STORE • SUPPORT TICKETS',
      embedDescription:
        initial?.embedDescription ??
        'Welcome to **MG3 Support Services**.\nPlease choose the appropriate service department from the select menu below to create your private ticket.',
      embedColor: initial?.embedColor ?? '#7c3aed',
      embedBannerUrl: initial?.embedBannerUrl ?? 'https://i.imghos.co/MtalsvvN.png',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        panelChannelId: initial.panelChannelId ?? '',
        categoryId: initial.categoryId ?? '',
        logChannelId: initial.logChannelId ?? '',
        supportRoleId: initial.supportRoleId ?? '',
        ceoRoleId: initial.ceoRoleId ?? '',
        enableTranscripts: initial.enableTranscripts ?? true,
        enableDmFeedback: initial.enableDmFeedback ?? true,
        embedTitle: initial.embedTitle ?? '🎫 MG3 STORE • SUPPORT TICKETS',
        embedDescription:
          initial.embedDescription ??
          'Welcome to **MG3 Support Services**.\nPlease choose the appropriate service department from the select menu below to create your private ticket.',
        embedColor: initial.embedColor ?? '#7c3aed',
        embedBannerUrl: initial.embedBannerUrl ?? 'https://i.imghos.co/MtalsvvN.png',
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Tickets Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  GUILD_ID: '${guild || 'GUILD_ID'}',
  TICKET_PANEL_CHANNEL_ID: '${values.panelChannelId || ''}',
  TICKET_CATEGORY_ID: '${values.categoryId || ''}',
  TICKET_LOG_CHANNEL_ID: '${values.logChannelId || ''}',
  GAME_SUPPORT_ROLE_ID: '${values.supportRoleId || ''}',
  CEO_ROLE_ID: '${values.ceoRoleId || ''}',
  ENABLE_TRANSCRIPTS: ${values.enableTranscripts ? 'true' : 'false'},
  ENABLE_DM_FEEDBACK: ${values.enableDmFeedback ? 'true' : 'false'},
  EMBED_TITLE: '${values.embedTitle || '🎫 MG3 STORE • SUPPORT TICKETS'}',
  EMBED_DESCRIPTION: '${(values.embedDescription || '').replace(/\n/g, ' ')}',
  EMBED_COLOR: '${values.embedColor || '#7c3aed'}',
  EMBED_BANNER_URL: '${values.embedBannerUrl || ''}'
};`;

  const onFormSubmit = async (data: TicketsFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={5} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Ticket Panel Channel',
              description: 'Channel where the ticket setup embed & dropdown are posted.',
            }}
            controller={{ control, name: 'panelChannelId' }}
          />
          <CategorySelectForm
            control={{
              label: 'Tickets Category',
              description: 'Discord Category under which new ticket channels are created.',
            }}
            controller={{ control, name: 'categoryId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Ticket Logs Channel',
              description: 'Channel where closed ticket logs and HTML transcripts are posted.',
            }}
            controller={{ control, name: 'logChannelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Support Role',
              description: 'Staff support role with access to view and claim tickets.',
            }}
            controller={{ control, name: 'supportRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'CEO / Admin Role',
              description: 'Admin role with full permission to manage, rename, and delete tickets.',
            }}
            controller={{ control, name: 'ceoRoleId' }}
          />
        </SimpleGrid>

        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading fontSize="md" fontWeight="600" mb={1} color="purple.300">
            🎨 Custom Discord Embed Message Designer
          </Heading>
          <Text fontSize="xs" color="TextSecondary" mb={4}>
            Customize the ticket panel appearance sent to your Discord channel.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <InputForm
              control={{
                label: 'Embed Title',
                description: 'Main header title of the ticket panel.',
              }}
              controller={{ control, name: 'embedTitle' }}
            />
            <InputForm
              control={{
                label: 'Embed Color (HEX)',
                description: 'Hex color for the Discord embed sidebar (e.g. #7c3aed).',
              }}
              controller={{ control, name: 'embedColor' }}
            />
          </SimpleGrid>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Embed Description / Instructions',
                description: 'Detailed instructions shown to users above the dropdown.',
              }}
              controller={{ control, name: 'embedDescription' }}
            />
          </Box>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Embed Banner Image URL',
                description: 'Large banner image attached at the bottom of the embed.',
              }}
              controller={{ control, name: 'embedBannerUrl' }}
            />
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'HTML Transcripts',
              description: 'Generate full HTML transcript file upon closing tickets.',
            }}
            controller={{ control, name: 'enableTranscripts' }}
          />
          <SwitchFieldForm
            control={{
              label: 'DM Feedback Form',
              description: 'Send direct message feedback rating request to ticket creator on close.',
            }}
            controller={{ control, name: 'enableDmFeedback' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Tickets Configuration"
          description="Guild-specific ticket configuration snippet."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
