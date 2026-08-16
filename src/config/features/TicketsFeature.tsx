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
  FormHelperText,
  Badge,
} from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { CategorySelectForm } from '@/components/forms/CategorySelect';
import { RoleSelectForm, RoleSelect } from '@/components/forms/RoleSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { InputForm } from '@/components/forms/InputForm';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { TicketsFeature, TicketDepartment } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FaPlus, FaTrash, FaTicketAlt } from 'react-icons/fa';

const DEFAULT_DEPARTMENTS: TicketDepartment[] = [
  {
    id: 'dept-1',
    label: 'Game Support',
    value: 'ARC',
    emoji: '🎮',
    description: 'Game accounts, boosts, and keys',
    welcomeMessage: 'Welcome! A game support specialist will be with you shortly.',
  },
  {
    id: 'dept-2',
    label: 'Orders & Payments',
    value: 'BUY_SELL',
    emoji: '🛒',
    description: 'Store purchases, invoices & receipts',
    welcomeMessage: 'Welcome to Store Orders! Please state your order details.',
  },
  {
    id: 'dept-3',
    label: 'Partnership & Marketing',
    value: 'MARKETING',
    emoji: '🤝',
    description: 'Partnership, creator deals & ads',
    welcomeMessage: 'Welcome to Marketing! Please submit your proposal or server link.',
  },
  {
    id: 'dept-4',
    label: 'CEO & Administration',
    value: 'SUPPORT_AND_INQUIRIES',
    emoji: '👑',
    description: 'Direct escalation with management',
    welcomeMessage: 'Direct management ticket. The CEO / Admin will review your request.',
  },
];

export const useTicketsFeature: UseFormRender<TicketsFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<TicketsFeature>({
    defaultValues: {
      panelChannelId: initial?.panelChannelId ?? '',
      categoryId: initial?.categoryId ?? '',
      logChannelId: initial?.logChannelId ?? '',
      supportRoleId: initial?.supportRoleId ?? '',
      ceoRoleId: initial?.ceoRoleId ?? '',
      enableTranscripts: initial?.enableTranscripts ?? true,
      enableDmFeedback: initial?.enableDmFeedback ?? true,
      embedTitle: initial?.embedTitle ?? '🎫 MG3 STORE • SUPPORT TICKETS',
      embedDescription:
        initial?.embedDescription ??
        'Welcome to **MG3 Support Services**.\nPlease choose the appropriate service department from the select menu below to create your private ticket.',
      embedColor: initial?.embedColor ?? '#7c3aed',
      embedBannerUrl: initial?.embedBannerUrl ?? 'https://i.imghos.co/MtalsvvN.png',
      departments: initial?.departments?.length ? initial.departments : DEFAULT_DEPARTMENTS,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departments',
  });

  useEffect(() => {
    if (initial) {
      reset({
        panelChannelId: initial.panelChannelId ?? '',
        categoryId: initial.categoryId ?? '',
        logChannelId: initial.logChannelId ?? '',
        supportRoleId: initial.supportRoleId ?? '',
        ceoRoleId: initial.ceoRoleId ?? '',
        enableTranscripts: initial.enableTranscripts ?? true,
        enableDmFeedback: initial.enableDmFeedback ?? true,
        embedTitle: initial.embedTitle ?? '🎫 MG3 STORE • SUPPORT TICKETS',
        embedDescription:
          initial.embedDescription ??
          'Welcome to **MG3 Support Services**.\nPlease choose the appropriate service department from the select menu below to create your private ticket.',
        embedColor: initial.embedColor ?? '#7c3aed',
        embedBannerUrl: initial.embedBannerUrl ?? 'https://i.imghos.co/MtalsvvN.png',
        departments: initial.departments?.length ? initial.departments : DEFAULT_DEPARTMENTS,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Tickets Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  GUILD_ID: '${guild || 'GUILD_ID'}',
  TICKET_PANEL_CHANNEL_ID: '${values.panelChannelId || ''}',
  TICKET_CATEGORY_ID: '${values.categoryId || ''}',
  TICKET_LOG_CHANNEL_ID: '${values.logChannelId || ''}',
  GAME_SUPPORT_ROLE_ID: '${values.supportRoleId || ''}',
  CEO_ROLE_ID: '${values.ceoRoleId || ''}',
  ENABLE_TRANSCRIPTS: ${values.enableTranscripts ? 'true' : 'false'},
  ENABLE_DM_FEEDBACK: ${values.enableDmFeedback ? 'true' : 'false'},
  EMBED_TITLE: '${values.embedTitle || '🎫 MG3 STORE • SUPPORT TICKETS'}',
  EMBED_DESCRIPTION: '${(values.embedDescription || '').replace(/\n/g, ' ')}',
  EMBED_COLOR: '${values.embedColor || '#7c3aed'}',
  EMBED_BANNER_URL: '${values.embedBannerUrl || ''}',
  DEPARTMENTS_COUNT: ${values.departments?.length || 0}
};`;

  const onFormSubmit = async (data: TicketsFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  const handleAddDepartment = () => {
    const nextIdx = fields.length + 1;
    append({
      id: `dept-${Date.now()}`,
      label: `Department ${nextIdx}`,
      value: `CUSTOM_${nextIdx}`,
      emoji: '🎫',
      description: `Custom support department #${nextIdx}`,
      welcomeMessage: 'Welcome to custom support! How can we assist you?',
    });
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={5} align="stretch">
        {/* Core Channels & Category Setup */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Ticket Panel Channel',
              description: 'Channel where the ticket setup embed & dropdown are posted.',
            }}
            controller={{ control, name: 'panelChannelId' }}
          />
          <CategorySelectForm
            control={{
              label: 'Tickets Category',
              description: 'Discord Category under which new ticket channels are created.',
            }}
            controller={{ control, name: 'categoryId' }}
          />
          <ChannelSelectForm
            control={{
              label: 'Ticket Logs Channel',
              description: 'Channel where closed ticket logs and HTML transcripts are posted.',
            }}
            controller={{ control, name: 'logChannelId' }}
          />
          <RoleSelectForm
            control={{
              label: 'Default Support Role',
              description: 'Staff support role with access to view and claim general tickets.',
            }}
            controller={{ control, name: 'supportRoleId' }}
          />
          <RoleSelectForm
            control={{
              label: 'CEO / Admin Role',
              description: 'Admin role with full permission to manage, rename, and delete tickets.',
            }}
            controller={{ control, name: 'ceoRoleId' }}
          />
        </SimpleGrid>

        {/* Custom Ticket Departments Builder (Premium) */}
        <Box p={5} bg="CardBackground" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
            <Box>
              <Flex align="center" gap={2}>
                <Heading fontSize="md" fontWeight="600" color="purple.300">
                  ⚙️ Ticket Departments & Categories (Custom Select Menu)
                </Heading>
                <Badge colorScheme="purple" rounded="full" px={2}>
                  {fields.length} Departments
                </Badge>
              </Flex>
              <Text fontSize="xs" color="TextSecondary" mt={1}>
                Add, customize, or remove the departments displayed in your Discord ticket select menu.
              </Text>
            </Box>
            <Button
              size="sm"
              colorScheme="purple"
              variant="solid"
              leftIcon={<FaPlus />}
              onClick={handleAddDepartment}
              rounded="xl"
            >
              Add Department
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
                pos="relative"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Flex align="center" gap={2}>
                    <FaTicketAlt color="#a855f7" />
                    <Text fontWeight="600" fontSize="sm" color="white">
                      Department #{index + 1}: {watch(`departments.${index}.label`) || 'New Department'}
                    </Text>
                  </Flex>
                  {fields.length > 1 && (
                    <IconButton
                      aria-label="Remove Department"
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
                      Department Label
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`departments.${index}.label`}
                      render={({ field: f }) => (
                        <Input {...f} size="sm" rounded="lg" placeholder="e.g. Game Support" />
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Emoji (Unicode or Custom)
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`departments.${index}.emoji`}
                      render={({ field: f }) => (
                        <Input {...f} size="sm" rounded="lg" placeholder="e.g. 🎮 or <:emoji:id>" />
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Identifier (Value)
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`departments.${index}.value`}
                      render={({ field: f }) => (
                        <Input {...f} size="sm" rounded="lg" placeholder="e.g. GAME_SUPPORT" />
                      )}
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mt={3}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Description (Sub-label in Dropdown)
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`departments.${index}.description`}
                      render={({ field: f }) => (
                        <Input {...f} size="sm" rounded="lg" placeholder="Short description in select menu" />
                      )}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" color="TextSecondary">
                      Department Support Role (Optional)
                    </FormLabel>
                    <Controller
                      control={control}
                      name={`departments.${index}.roleId`}
                      render={({ field: f }) => (
                        <RoleSelect
                          value={f.value}
                          onChange={f.onChange}
                          isClearable
                          placeholder="Select specific support role"
                        />
                      )}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl mt={3}>
                  <FormLabel fontSize="xs" color="TextSecondary">
                    Welcome Message Inside Created Ticket
                  </FormLabel>
                  <Controller
                    control={control}
                    name={`departments.${index}.welcomeMessage`}
                    render={({ field: f }) => (
                      <Input
                        {...f}
                        size="sm"
                        rounded="lg"
                        placeholder="Message sent automatically when this ticket is opened"
                      />
                    )}
                  />
                  <FormHelperText fontSize="10px">
                    Supports <code>{'{user}'}</code> and <code>{'{department}'}</code> placeholders.
                  </FormHelperText>
                </FormControl>
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
            Customize the ticket panel appearance sent to your Discord channel.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <InputForm
              control={{
                label: 'Embed Title',
                description: 'Main header title of the ticket panel.',
              }}
              controller={{ control, name: 'embedTitle' }}
            />
            <InputForm
              control={{
                label: 'Embed Color (HEX)',
                description: 'Hex color for the Discord embed sidebar (e.g. #7c3aed).',
              }}
              controller={{ control, name: 'embedColor' }}
            />
          </SimpleGrid>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Embed Description / Instructions',
                description: 'Detailed instructions shown to users above the dropdown.',
              }}
              controller={{ control, name: 'embedDescription' }}
            />
          </Box>
          <Box mt={4}>
            <InputForm
              control={{
                label: 'Embed Banner Image URL',
                description: 'Large banner image attached at the bottom of the embed.',
              }}
              controller={{ control, name: 'embedBannerUrl' }}
            />
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'HTML Transcripts',
              description: 'Generate full HTML transcript file upon closing tickets.',
            }}
            controller={{ control, name: 'enableTranscripts' }}
          />
          <SwitchFieldForm
            control={{
              label: 'DM Feedback Form',
              description: 'Send direct message feedback rating request to ticket creator on close.',
            }}
            controller={{ control, name: 'enableDmFeedback' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Tickets Configuration"
          description="Guild-specific ticket configuration snippet."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
