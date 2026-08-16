import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { FeedbackFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useFeedbackFeature: UseFormRender<FeedbackFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<FeedbackFeature>({
    defaultValues: {
      channelId: initial?.channelId ?? '',
      enableRatingStars: initial?.enableRatingStars ?? true,
      enableComments: initial?.enableComments ?? true,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? '',
        enableRatingStars: initial.enableRatingStars ?? true,
        enableComments: initial.enableComments ?? true,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Feedback Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  FEEDBACK_CHANNEL_ID: '${values.channelId || ''}',
  ENABLE_STAR_RATINGS: ${values.enableRatingStars ? 'true' : 'false'},
  ENABLE_FEEDBACK_COMMENTS: ${values.enableComments ? 'true' : 'false'}
};`;

  const onFormSubmit = async (data: FeedbackFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={4} align="stretch">
        <ChannelSelectForm
          control={{
            label: 'Customer Feedback Channel',
            description: 'Channel where post-order feedback and ratings are published.',
          }}
          controller={{ control, name: 'channelId' }}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: '5-Star Ratings',
              description: 'Collect 1-5 star ratings with graphical stars embed.',
            }}
            controller={{ control, name: 'enableRatingStars' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Text Feedback Comments',
              description: 'Allow customers to write detailed comments and reviews.',
            }}
            controller={{ control, name: 'enableComments' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Feedback Configuration"
          description="Guild-specific customer reviews & feedback mapping."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
