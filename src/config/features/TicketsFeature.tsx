import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { TicketsFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

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
    },
  });

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
  ENABLE_DM_FEEDBACK: ${values.enableDmFeedback ? 'true' : 'false'}
};`;

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit((values) => onSubmit(JSON.stringify(values))),
    component: (
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Ticket Panel Channel',
              description: 'Channel where the /ticketsetup panel message is sent.',
            }}
            controller={{ control, name: 'panelChannelId' }}
          />
          <ChannelSelectForm
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
