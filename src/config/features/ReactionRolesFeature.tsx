import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { ReactionRolesFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const useReactionRolesFeature: UseFormRender<ReactionRolesFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<ReactionRolesFeature>({
    defaultValues: {
      reactionRoleChannelId: initial?.reactionRoleChannelId ?? '',
      arcRaidersRoleId: initial?.arcRaidersRoleId ?? '',
      overwatchRoleId: initial?.overwatchRoleId ?? '',
      rocketLeagueRoleId: initial?.rocketLeagueRoleId ?? '',
      marvelRivalsRoleId: initial?.marvelRivalsRoleId ?? '',
      valorantRoleId: initial?.valorantRoleId ?? '',
      codRoleId: initial?.codRoleId ?? '',
      fcRoleId: initial?.fcRoleId ?? '',
      fivemRoleId: initial?.fivemRoleId ?? '',
    },
  });

  const values = watch();

  const exportText = `// MG3 Reaction Game Roles for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  REACTION_ROLE_CHANNEL_ID: '${values.reactionRoleChannelId || ''}',
  REACTION_ROLES: [
    { emojiName: 'MG3_ARC_Raiders', roleId: '${values.arcRaidersRoleId || ''}' },
    { emojiName: 'MG3_overwatch', roleId: '${values.overwatchRoleId || ''}' },
    { emojiName: 'MG3_Rocket_League', roleId: '${values.rocketLeagueRoleId || ''}' },
    { emojiName: 'MG3_MARVL_RIVELS', roleId: '${values.marvelRivalsRoleId || ''}' },
    { emojiName: 'MG3_VALORANT', roleId: '${values.valorantRoleId || ''}' },
    { emojiName: 'MG3_COD', roleId: '${values.codRoleId || ''}' },
    { emojiName: 'MG3_FC', roleId: '${values.fcRoleId || ''}' },
    { emojiName: 'MG3_FIVEAM', roleId: '${values.fivemRoleId || ''}' }
  ]
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
              label: 'Reaction Roles Channel',
              description: 'Channel where the game roles embed message and reactions are posted.',
            }}
            controller={{ control, name: 'reactionRoleChannelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'ARC Raiders Role',
              description: 'Role assigned for ARC Raiders reaction.',
            }}
            controller={{ control, name: 'arcRaidersRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Overwatch 2 Role',
              description: 'Role assigned for Overwatch reaction.',
            }}
            controller={{ control, name: 'overwatchRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Rocket League Role',
              description: 'Role assigned for Rocket League reaction.',
            }}
            controller={{ control, name: 'rocketLeagueRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Marvel Rivals Role',
              description: 'Role assigned for Marvel Rivals reaction.',
            }}
            controller={{ control, name: 'marvelRivalsRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Valorant Role',
              description: 'Role assigned for Valorant reaction.',
            }}
            controller={{ control, name: 'valorantRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Call of Duty (COD) Role',
              description: 'Role assigned for Call of Duty reaction.',
            }}
            controller={{ control, name: 'codRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'EA Sports FC Role',
              description: 'Role assigned for FC reaction.',
            }}
            controller={{ control, name: 'fcRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'FiveM / GTA V Role',
              description: 'Role assigned for FiveM reaction.',
            }}
            controller={{ control, name: 'fivemRoleId' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Reaction Roles Configuration"
          description="Guild-specific 8 game reaction roles mapping."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
