import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { InputForm } from '@/components/forms/InputForm';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { ReactionRolesFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useReactionRolesFeature: UseFormRender<ReactionRolesFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<ReactionRolesFeature>({
    defaultValues: {
      channelId: initial?.channelId ?? '',
      messageId: initial?.messageId ?? '',
      roleId: initial?.roleId ?? '',
      emoji: initial?.emoji ?? '⭐',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? '',
        messageId: initial.messageId ?? '',
        roleId: initial.roleId ?? '',
        emoji: initial.emoji ?? '⭐',
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Reaction Roles Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  REACTION_ROLES_CHANNEL_ID: '${values.channelId || ''}',
  REACTION_MESSAGE_ID: '${values.messageId || ''}',
  REACTION_ROLE_ID: '${values.roleId || ''}',
  REACTION_EMOJI: '${values.emoji || '⭐'}'
};`;

  const onFormSubmit = async (data: ReactionRolesFeature) => {
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
              label: 'Reaction Roles Channel',
              description: 'Channel containing the reaction role message embed.',
            }}
            controller={{ control, name: 'channelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Assigned Role',
              description: 'Role awarded or revoked upon clicking reaction emoji.',
            }}
            controller={{ control, name: 'roleId' }}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <InputForm
            control={{
              label: 'Discord Message ID',
              description: 'ID of the Discord message to attach reactions to.',
            }}
            controller={{ control, name: 'messageId' }}
          />
          <InputForm
            control={{
              label: 'Emoji',
              description: 'Unicode emoji (e.g. ⭐, 🎮) or custom Discord emoji ID.',
            }}
            controller={{ control, name: 'emoji' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Reaction Roles Configuration"
          description="Guild-specific message reaction role binding."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
