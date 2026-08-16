import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { InputForm } from '@/components/forms/InputForm';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { FeedbackFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useFeedbackFeature: UseFormRender<FeedbackFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<FeedbackFeature>({
    defaultValues: {
      feedbackChannelId: initial?.feedbackChannelId ?? '',
      bannerUrl: initial?.bannerUrl ?? '',
    },
  });

  const values = watch();

  const exportText = `// MG3 Feedback & Reviews Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  FEEDBACK_CHANNEL_ID: '${values.feedbackChannelId || ''}',
  FEEDBACK_BANNER_URL: '${values.bannerUrl || ''}'
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
              label: 'Feedback Showcase Channel',
              description: 'Channel where customer reviews and 1-5 star ratings are published.',
            }}
            controller={{ control, name: 'feedbackChannelId' }}
          />
          <InputForm
            control={{
              label: 'Feedback Banner URL',
              description: 'Image banner URL attached below feedback review embeds.',
            }}
            controller={{ control, name: 'bannerUrl' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Feedback Configuration"
          description="Guild-specific customer reviews and rating channel settings."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
