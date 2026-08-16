import {
  SimpleGrid,
  VStack,
  Box,
  Heading,
  Text,
  Button,
  Flex,
  IconButton,
  Input,
  FormLabel,
  FormControl,
  Badge,
} from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { RoleSelect } from '@/components/forms/RoleSelect';
import { InputForm } from '@/components/forms/InputForm';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { ReactionRolesFeature, ReactionRoleItem } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FaPlus, FaTrash, FaGamepad } from 'react-icons/fa';

const DEFAULT_ROLE_ITEMS: ReactionRoleItem[] = [
  { id: 'rr-1', roleId: '', label: 'ARC Raiders', emoji: '🏹', style: 'secondary' },
  { id: 'rr-2', roleId: '', label: 'Overwatch 2', emoji: '🛡️', style: 'secondary' },
  { id: 'rr-3', roleId: '', label: 'Rocket League', emoji: '🏎️', style: 'secondary' },
  { id: 'rr-4', roleId: '', label: 'Marvel Rivals', emoji: '⚡', style: 'secondary' },
  { id: 'rr-5', roleId: '', label: 'Valorant', emoji: '🎯', style: 'secondary' },
  { id: 'rr-6', roleId: '', label: 'Call of Duty', emoji: '🔫', style: 'secondary' },
  { id: 'rr-7', roleId: '', label: 'EA Sports FC', emoji: '⚽', style: 'secondary' },
  { id: 'rr-8', roleId: '', label: 'FiveM GTA', emoji: '🚗', style: 'secondary' },
];

export const useReactionRolesFeature: UseFormRender<ReactionRolesFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<ReactionRolesFeature>({
    defaultValues: {
      channelId: initial?.channelId ?? initial?.reactionRoleChannelId ?? '',
      panelTitle: initial?.panelTitle ?? '🎮 CHOOSE YOUR GAMING ROLES',
      panelDescription:
        initial?.panelDescription ??
        'Select the games you play by clicking the buttons below to receive updates, ping notifications, and unlock game channels!',
      panelColor: initial?.panelColor ?? '#7c3aed',
      panelBannerUrl: initial?.panelBannerUrl ?? 'https://i.imghos.co/MLyjjcyY.webp',
      items: initial?.items?.length ? initial.items : DEFAULT_ROLE_ITEMS,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (initial) {
      reset({
        channelId: initial.channelId ?? initial.reactionRoleChannelId ?? '',
        panelTitle: initial.panelTitle ?? '🎮 CHOOSE YOUR GAMING ROLES',
        panelDescription:
          initial.panelDescription ??
          'Select the games you play by clicking the buttons below to receive updates, ping notifications, and unlock game channels!',
        panelColor: initial.panelColor ?? '#7c3aed',
        panelBannerUrl: initial.panelBannerUrl ?? 'https://i.imghos.co/MLyjjcyY.webp',
        items: initial.items?.length ? initial.items : DEFAULT_ROLE_ITEMS,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Reaction Game Roles Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  GUILD_ID: '${guild || 'GUILD_ID'}',
  REACTION_ROLE_CHANNEL_ID: '${values.channelId || ''}',
  PANEL_TITLE: '${values.panelTitle || '🎮 CHOOSE YOUR GAMING ROLES'}',
  PANEL_DESCRIPTION: '${(values.panelDescription || '').replace(/\n/g, ' ')}',
  PANEL_COLOR: '${values.panelColor || '#7c3aed'}',
  PANEL_BANNER_URL: '${values.panelBannerUrl || ''}',
  ROLES_COUNT: ${values.items?.length || 0}
};`;

  const onFormSubmit = async (data: ReactionRolesFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  const handleAddRole = () => {
    const nextIdx = fields.length + 1;
    append({
      id: `rr-${Date.now()}`,
      roleId: '',
      label: `Role ${nextIdx}`,
      emoji: '🎮',
      style: 'secondary',
    });
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={5} align="stretch">
        {/* Target Channel */}
        <ChannelSelectForm
          control={{
            label: 'Reaction Roles Channel',
            description: 'Channel where the gaming roles panel and interactive buttons will be published.',
          }}
          controller={{ control, name: 'channelId' }}
        />

        {/* Roles Builder */}
        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
            <Box>
              <Flex align="center" gap={2}>
                <Heading fontSize="md" fontWeight="600" color="purple.300">
                  🕹️ Interactive Game Roles (Button Grid Builder)
                </Heading>
                <Badge colorScheme="purple" rounded="full" px={2}>
                  {fields.length} Roles
                </Badge>
              </Flex>
              <Text fontSize="xs" color="TextSecondary" mt={1}>
                Add custom roles that users can toggle on/off by clicking buttons in Discord.
              </Text>
            </Box>
            <Button
              size="sm"
              colorScheme="purple"
              variant="solid"
              leftIcon={<FaPlus />}
              onClick={handleAddRole}
              rounded="xl"
            >
              Add Role Button
            </Button>
          </Flex>

          <VStack spacing={4} align="stretch" mt={4}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                p={4}
                bg="blackAlpha.400"
                rounded="xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Flex align="center" gap={2}>
                    <FaGamepad color="#a855f7" />
                    <Text fontWeight="600" fontSize="sm" color="white">
                      Role #{index + 1}: {watch(`items.${index}.label`) || 'New Role'}
                    </Text>
                  </Flex>
                  {fields.length > 1 && (
                    <IconButton
                      aria-label="Remove Role"
                      icon={<FaTrash />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => remove(index)}
                    />
                  )}
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Button Label
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`items.${index}.label`}
                      render={({ field: f }) => (
                        <Input {...f} size="sm" rounded="lg" placeholder="e.g. Valorant" />
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Emoji (Unicode or Custom)
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`items.${index}.emoji`}
                      render={({ field: f }) => (
                        <Input {...f} size="sm" rounded="lg" placeholder="e.g. 🎯 or <:emoji:id>" />
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Select Discord Role
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`items.${index}.roleId`}
                      render={({ field: f }) => (
                        <RoleSelect
                          value={f.value}
                          onChange={f.onChange}
                          placeholder="Select Role to award"
                        />
                      )}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Custom Discord Embed Message Designer */}
        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Heading fontSize="md" fontWeight="600" mb={1} color="purple.300">
            🎨 Custom Discord Embed Message Designer
          </Heading>
          <Text fontSize="xs" color="TextSecondary" mb={4}>
            Customize the message title, colors, and banner image displayed above the role buttons.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <InputForm
              control={{
                label: 'Embed Title',
                description: 'Main header title of the reaction roles embed.',
              }}
              controller={{ control, name: 'panelTitle' }}
            />
            <InputForm
              control={{
                label: 'Embed Color (HEX)',
                description: 'Hex color for the Discord embed sidebar (e.g. #7c3aed).',
              }}
              controller={{ control, name: 'panelColor' }}
            />
          </SimpleGrid>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Embed Description / Instructions',
                description: 'Instructions explaining how users can click buttons to claim roles.',
              }}
              controller={{ control, name: 'panelDescription' }}
            />
          </Box>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Embed Banner Image URL',
                description: 'Large promotional or game artwork banner.',
              }}
              controller={{ control, name: 'panelBannerUrl' }}
            />
          </Box>
        </Box>

        <ConfigExportCard
          title="Export Reaction Roles Configuration"
          description="Guild-specific message reaction role binding."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
