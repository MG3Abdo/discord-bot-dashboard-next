import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { InputForm } from '@/components/forms/InputForm';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { WelcomeFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useWelcomeFeature: UseFormRender<WelcomeFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<WelcomeFeature>({
    defaultValues: {
      channelId: initial?.channelId ?? '',
      message: initial?.message ?? 'Welcome to {server}, {user}!',
      autoRoleId: initial?.autoRoleId ?? '',
      enableImage: initial?.enableImage ?? true,
      enableDm: initial?.enableDm ?? false,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? '',
        message: initial.message ?? 'Welcome to {server}, {user}!',
        autoRoleId: initial.autoRoleId ?? '',
        enableImage: initial.enableImage ?? true,
        enableDm: initial.enableDm ?? false,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Welcome Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  WELCOME_CHANNEL_ID: '${values.channelId || ''}',
  WELCOME_MESSAGE: '${values.message || ''}',
  AUTO_ROLE_ID: '${values.autoRoleId || ''}',
  ENABLE_WELCOME_IMAGE: ${values.enableImage ? 'true' : 'false'},
  ENABLE_WELCOME_DM: ${values.enableDm ? 'true' : 'false'}
};`;

  const onFormSubmit = async (data: WelcomeFeature) => {
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
              label: 'Welcome Channel',
              description: 'Channel where welcome messages are sent.',
            }}
            controller={{ control, name: 'channelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Auto-Role',
              description: 'Role given automatically to new members.',
            }}
            controller={{ control, name: 'autoRoleId' }}
          />
        </SimpleGrid>

        <InputForm
          control={{
            label: 'Welcome Message Template',
            description: 'Supported tags: {user}, {server}, {members}',
          }}
          controller={{ control, name: 'message' }}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Welcome Card Banner Image',
              description: 'Generate dynamic canvas welcome card image.',
            }}
            controller={{ control, name: 'enableImage' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Send Welcome DM',
              description: 'Send direct message to new member upon joining.',
            }}
            controller={{ control, name: 'enableDm' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Welcome Configuration"
          description="Guild-specific welcome system configuration snippet."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
