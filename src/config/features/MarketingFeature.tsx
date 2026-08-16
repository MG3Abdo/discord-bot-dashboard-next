import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { MarketingFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useMarketingFeature: UseFormRender<MarketingFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<MarketingFeature>({
    defaultValues: {
      requestChannelId: initial?.requestChannelId ?? '',
      logChannelId: initial?.logChannelId ?? '',
      marketingRoleId: initial?.marketingRoleId ?? '',
      leaderRoleId: initial?.leaderRoleId ?? '',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        requestChannelId: initial.requestChannelId ?? '',
        logChannelId: initial.logChannelId ?? '',
        marketingRoleId: initial.marketingRoleId ?? '',
        leaderRoleId: initial.leaderRoleId ?? '',
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Marketing Requests Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  MARKETING_REQUEST_CHANNEL_ID: '${values.requestChannelId || ''}',
  MARKETING_LOG_CHANNEL_ID: '${values.logChannelId || ''}',
  MARKETING_ROLE_ID: '${values.marketingRoleId || ''}',
  MARKETING_LEADER_ROLE_ID: '${values.leaderRoleId || ''}'
};`;

  const onFormSubmit = async (data: MarketingFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Marketing Request Channel',
              description: 'Channel where members submit partner and marketing ads.',
            }}
            controller={{ control, name: 'requestChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Marketing Logs Channel',
              description: 'Channel where accepted ads and delivery receipts are recorded.',
            }}
            controller={{ control, name: 'logChannelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Marketing Team Role',
              description: 'Role for marketing agents allowed to deliver partner ads.',
            }}
            controller={{ control, name: 'marketingRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Marketing Leader Role',
              description: 'Lead marketing manager with approval / reject permissions.',
            }}
            controller={{ control, name: 'leaderRoleId' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Marketing Configuration"
          description="Guild-specific 4-channel/role marketing system configuration."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
