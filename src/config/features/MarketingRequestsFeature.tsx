import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { MarketingRequestsFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useMarketingRequestsFeature: UseFormRender<MarketingRequestsFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<MarketingRequestsFeature>({
    defaultValues: {
      marketingRoleId: initial?.marketingRoleId ?? '',
      marketingLeaderRoleId: initial?.marketingLeaderRoleId ?? '',
      logDoneChannelId: initial?.logDoneChannelId ?? '',
      logDeleteChannelId: initial?.logDeleteChannelId ?? '',
    },
  });

  const values = watch();

  const exportText = `// MG3 Marketing Requests Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  MARKETING_ROLE_ID: '${values.marketingRoleId || ''}',
  MARKETING_LEADER_ROLE_ID: '${values.marketingLeaderRoleId || ''}',
  LOG_CHANNEL_DONE: '${values.logDoneChannelId || ''}',
  LOG_CHANNEL_DELETE: '${values.logDeleteChannelId || ''}'
};`;

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit((values) => onSubmit(JSON.stringify(values))),
    component: (
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <RoleSelectForm
            control={{
              label: 'Marketing Role',
              description: 'Role pinged automatically when a new store request is posted.',
            }}
            controller={{ control, name: 'marketingRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Marketing Leader Role',
              description: 'Leader role permitted to edit or cancel marketing orders.',
            }}
            controller={{ control, name: 'marketingLeaderRoleId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Delivered Orders Log Channel',
              description: 'Channel where completed/delivered order logs are sent.',
            }}
            controller={{ control, name: 'logDoneChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Cancelled Orders Log Channel',
              description: 'Channel where cancelled order logs are sent.',
            }}
            controller={{ control, name: 'logDeleteChannelId' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Marketing Requests Configuration"
          description="Guild-specific marketing roles and completion log channels."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
