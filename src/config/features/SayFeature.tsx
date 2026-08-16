import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { InputForm } from '@/components/forms/InputForm';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { SayFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useSayFeature: UseFormRender<SayFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<SayFeature>({
    defaultValues: {
      defaultChannelId: initial?.defaultChannelId ?? '',
      buyButtonUrl: initial?.buyButtonUrl ?? '',
      otherPaymentButtonUrl: initial?.otherPaymentButtonUrl ?? '',
    },
  });

  const values = watch();

  const exportText = `// MG3 Announcements (/say) Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  DEFAULT_ANNOUNCE_CHANNEL_ID: '${values.defaultChannelId || ''}',
  BUY_BUTTON_URL: '${values.buyButtonUrl || ''}',
  OTHER_PAYMENT_BUTTON_URL: '${values.otherPaymentButtonUrl || ''}'
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
              label: 'Default Announcements Channel',
              description: 'Default target channel for /say stock and /say text broadcasts.',
            }}
            controller={{ control, name: 'defaultChannelId' }}
          />
          <InputForm
            control={{
              label: 'Buy Button Link URL',
              description: 'Optional URL button attached under stock announcements.',
            }}
            controller={{ control, name: 'buyButtonUrl' }}
          />
          <InputForm
            control={{
              label: 'Other Payment Button Link URL',
              description: 'Optional secondary payment URL button attached under stock announcements.',
            }}
            controller={{ control, name: 'otherPaymentButtonUrl' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Announcements Configuration"
          description="Guild-specific /say and store button URLs."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
