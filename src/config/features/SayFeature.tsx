import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { SayFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useSayFeature: UseFormRender<SayFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<SayFeature>({
    defaultValues: {
      defaultChannelId: initial?.defaultChannelId ?? '',
      allowedRoleId: initial?.allowedRoleId ?? '',
      enableEmbeds: initial?.enableEmbeds ?? true,
      logChannelId: initial?.logChannelId ?? '',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        defaultChannelId: initial.defaultChannelId ?? '',
        allowedRoleId: initial.allowedRoleId ?? '',
        enableEmbeds: initial.enableEmbeds ?? true,
        logChannelId: initial.logChannelId ?? '',
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Say System Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  SAY_DEFAULT_CHANNEL_ID: '${values.defaultChannelId || ''}',
  SAY_ALLOWED_ROLE_ID: '${values.allowedRoleId || ''}',
  SAY_ENABLE_EMBEDS: ${values.enableEmbeds ? 'true' : 'false'},
  SAY_LOG_CHANNEL_ID: '${values.logChannelId || ''}'
};`;

  const onFormSubmit = async (data: SayFeature) => {
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
              label: 'Default Broadcast Channel',
              description: 'Target channel where /say announcements are posted.',
            }}
            controller={{ control, name: 'defaultChannelId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Broadcast Audit Logs Channel',
              description: 'Security audit channel logging which admin ran /say and content.',
            }}
            controller={{ control, name: 'logChannelId' }}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <RoleSelectForm
            control={{
              label: 'Authorized Broadcaster Role',
              description: 'Role allowed to use /say and /say-embed commands.',
            }}
            controller={{ control, name: 'allowedRoleId' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Rich Embed Formatting',
              description: 'Send messages formatted inside structured Discord embeds.',
            }}
            controller={{ control, name: 'enableEmbeds' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Say Configuration"
          description="Guild-specific broadcast command configuration snippet."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
