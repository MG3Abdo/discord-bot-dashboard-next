import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { ServerLogsFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useServerLogsFeature: UseFormRender<ServerLogsFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<ServerLogsFeature>({
    defaultValues: {
      memberJoinChannel: initial?.memberJoinChannel ?? '',
      memberLeftChannel: initial?.memberLeftChannel ?? '',
      messageDeleteChannel: initial?.messageDeleteChannel ?? '',
      messageEditChannel: initial?.messageEditChannel ?? '',
      roleEventsChannel: initial?.roleEventsChannel ?? '',
      channelEventsChannel: initial?.channelEventsChannel ?? '',
      voiceStateChannel: initial?.voiceStateChannel ?? '',
      memberModChannel: initial?.memberModChannel ?? '',
      autoJoinRoleId: initial?.autoJoinRoleId ?? '',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        memberJoinChannel: initial.memberJoinChannel || '1240011818223796284',
        memberLeftChannel: initial.memberLeftChannel || '1240011818223796284',
        messageDeleteChannel: initial.messageDeleteChannel || '1240011786523115591',
        messageEditChannel: initial.messageEditChannel || '1240011786523115591',
        roleEventsChannel: initial.roleEventsChannel || '1240011874259832863',
        channelEventsChannel: initial.channelEventsChannel || '1240011874259832863',
        voiceStateChannel: initial.voiceStateChannel || '1240012091293831178',
        memberModChannel: initial.memberModChannel || '1240011818223796284',
        autoJoinRoleId: initial.autoJoinRoleId || '939445945320505394',
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Server Logs Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  MEMBER_JOIN_LOG_CHANNEL_ID: '${values.memberJoinChannel || ''}',
  MEMBER_LEFT_LOG_CHANNEL_ID: '${values.memberLeftChannel || ''}',
  MESSAGE_DELETE_LOG_CHANNEL_ID: '${values.messageDeleteChannel || ''}',
  MESSAGE_EDIT_LOG_CHANNEL_ID: '${values.messageEditChannel || ''}',
  ROLE_LOG_CHANNEL_ID: '${values.roleEventsChannel || ''}',
  CHANNEL_LOG_CHANNEL_ID: '${values.channelEventsChannel || ''}',
  VOICE_STATE_LOG_CHANNEL_ID: '${values.voiceStateChannel || ''}',
  MODERATION_LOG_CHANNEL_ID: '${values.memberModChannel || ''}',
  AUTO_JOIN_ROLE_ID: '${values.autoJoinRoleId || ''}'
};`;

  const onFormSubmit = async (data: ServerLogsFeature) => {
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
              label: 'Member Join Log',
              description: 'Logs when a new member joins the Discord server.',
            }}
            controller={{ control, name: 'memberJoinChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Member Leave Log',
              description: 'Logs when a member leaves or is removed.',
            }}
            controller={{ control, name: 'memberLeftChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Message Delete Log',
              description: 'Logs deleted messages and attachments.',
            }}
            controller={{ control, name: 'messageDeleteChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Message Edit Log',
              description: 'Logs edited message content before and after.',
            }}
            controller={{ control, name: 'messageEditChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Role Events Log',
              description: 'Logs role creation, deletion, updates, and member role assignment.',
            }}
            controller={{ control, name: 'roleEventsChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Channel Events Log',
              description: 'Logs channel creation, update, and deletion.',
            }}
            controller={{ control, name: 'channelEventsChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Voice State Log',
              description: 'Logs voice channel join, leave, mute, and deafen events.',
            }}
            controller={{ control, name: 'voiceStateChannel' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Moderation Log (Bans/Kicks/Timeouts)',
              description: 'Logs user kicks, bans, unbans, and timeouts.',
            }}
            controller={{ control, name: 'memberModChannel' }}
          />
          <RoleSelectForm
            control={{
              label: 'Auto-Join Role',
              description: 'Role assigned automatically to new members on joining.',
            }}
            controller={{ control, name: 'autoJoinRoleId' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Server Logs Configuration"
          description="Guild-specific 19-event server audit logs mapping."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
