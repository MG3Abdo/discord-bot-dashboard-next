import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { InviteLogFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useInviteLogFeature: UseFormRender<InviteLogFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<InviteLogFeature>({
    defaultValues: {
      enabled: initial?.enabled ?? true,
      inviteLogChannelId: initial?.inviteLogChannelId ?? '',
    },
  });

  const values = watch();

  const exportText = `// MG3 Invite Logger Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  INVITE_LOG_ENABLED: ${values.enabled ? 'true' : 'false'},
  INVITE_LOG_CHANNEL_ID: '${values.inviteLogChannelId || ''}'
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
              label: 'Invite Log Channel',
              description: 'Channel where dedicated invite embeds and account age statistics are sent.',
            }}
            controller={{ control, name: 'inviteLogChannelId' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Enable Invite Logger',
              description: 'Tracks who invited whom with total invite counts and animated reactions.',
            }}
            controller={{ control, name: 'enabled' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Invite Logger Configuration"
          description="Guild-specific invite logger configuration."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
