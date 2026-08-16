import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { SuggestionsFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useSuggestionsFeature: UseFormRender<SuggestionsFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<SuggestionsFeature>({
    defaultValues: {
      suggestionsChannelId: initial?.suggestionsChannelId ?? '',
      suggestionsLogChannelId: initial?.suggestionsLogChannelId ?? '',
      staffRoleId: initial?.staffRoleId ?? '',
    },
  });

  const values = watch();

  const exportText = `// MG3 Suggestions Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  SUGGESTIONS_CHANNEL_ID: '${values.suggestionsChannelId || ''}',
  SUGGESTIONS_LOG_CHANNEL_ID: '${values.suggestionsLogChannelId || ''}',
  STAFF_ROLE_ID: '${values.staffRoleId || ''}'
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
              label: 'Suggestions Channel',
              description: 'Channel where user messages are converted into voting embeds.',
            }}
            controller={{ control, name: 'suggestionsChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Suggestions Log Channel',
              description: 'Channel where approved and rejected decisions are logged.',
            }}
            controller={{ control, name: 'suggestionsLogChannelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Staff Moderator Role',
              description: 'Staff role allowed to approve, reject, and edit suggestions.',
            }}
            controller={{ control, name: 'staffRoleId' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Suggestions Configuration"
          description="Guild-specific suggestions channels and staff roles."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
