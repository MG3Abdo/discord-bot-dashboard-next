import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { SuggestionsFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useSuggestionsFeature: UseFormRender<SuggestionsFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<SuggestionsFeature>({
    defaultValues: {
      channelId: initial?.channelId ?? '',
      enableThreads: initial?.enableThreads ?? true,
      enableReactions: initial?.enableReactions ?? true,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? '',
        enableThreads: initial.enableThreads ?? true,
        enableReactions: initial.enableReactions ?? true,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Suggestions Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  SUGGESTION_CHANNEL_ID: '${values.channelId || ''}',
  ENABLE_SUGGESTION_THREADS: ${values.enableThreads ? 'true' : 'false'},
  ENABLE_SUGGESTION_REACTIONS: ${values.enableReactions ? 'true' : 'false'}
};`;

  const onFormSubmit = async (data: SuggestionsFeature) => {
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
            label: 'Suggestions Channel',
            description: 'Channel where /suggest messages are published and voted on.',
          }}
          controller={{ control, name: 'channelId' }}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Discussion Threads',
              description: 'Automatically create a dedicated thread for each suggestion.',
            }}
            controller={{ control, name: 'enableThreads' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Vote Reactions',
              description: 'Automatically add upvote/downvote reaction buttons.',
            }}
            controller={{ control, name: 'enableReactions' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Suggestions Configuration"
          description="Guild-specific suggestions channel configuration."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
