import { SimpleGrid, VStack } from '@chakra-ui/react';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { BlacklistFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useBlacklistFeature: UseFormRender<BlacklistFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<BlacklistFeature>({
    defaultValues: {
      blacklistRoleId: initial?.blacklistRoleId ?? '',
      ceoRoleId: initial?.ceoRoleId ?? '',
      blockTickets: initial?.blockTickets ?? true,
      deleteRequestMessages: initial?.deleteRequestMessages ?? true,
    },
  });

  const values = watch();

  const exportText = `// MG3 Blacklist Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  BLACKLIST_ROLE_ID: '${values.blacklistRoleId || ''}',
  CEO_ROLE_ID: '${values.ceoRoleId || ''}',
  BLOCK_TICKETS: ${values.blockTickets ? 'true' : 'false'},
  DELETE_REQUEST_MESSAGES: ${values.deleteRequestMessages ? 'true' : 'false'}
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
              label: 'Blacklist Role',
              description: 'Role given to blacklisted users automatically to restrict channel access.',
            }}
            controller={{ control, name: 'blacklistRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'CEO / Admin Role',
              description: 'Role with permissions to manage /blacklist add, remove, and list.',
            }}
            controller={{ control, name: 'ceoRoleId' }}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Block Ticket Creation',
              description: 'Prevent blacklisted users from opening or interacting with tickets.',
            }}
            controller={{ control, name: 'blockTickets' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Delete Request Messages',
              description: 'Auto-delete messages sent by blacklisted users in order request channels.',
            }}
            controller={{ control, name: 'deleteRequestMessages' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Blacklist Configuration"
          description="Guild-specific blacklist role and moderation settings."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
