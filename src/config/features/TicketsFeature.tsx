import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { CategorySelectForm } from '@/components/forms/CategorySelect';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { InputForm } from '@/components/forms/InputForm';
import { useForm, useFieldArray } from 'react-hook-form';
import { UseFormRender } from '@/config/types';
import { TicketsFeature, TicketDepartment } from '@/config/types/custom-types';
import { useEffect } from 'react';
import { FaPlus, FaTrash, FaTicketAlt } from 'react-icons/fa';

const OFFICIAL_PANEL_CHANNEL_ID = '1520717489548558416'; // [TICKETS] # 📩 ᚛ TICKET・CENTER
const OFFICIAL_CATEGORY_ID = '1520716447817531402'; // 📁 TICKETS
const OFFICIAL_LOG_CHANNEL_ID = '1521039167100944505'; // [LOGS] #securtlogs
const OFFICIAL_CEO_ROLE_ID = '1295921618400313434'; // @MG 〢 CEO
const OFFICIAL_SUPPORT_ROLE_ID = '1295921618400313434'; // @MG 〢 CEO
const OFFICIAL_BANNER_URL = 'https://i.imghos.co/BFqJGjlN.jpg';
const OFFICIAL_EMBED_TITLE = 'Click below to create a new ticket';

const DEFAULT_DEPARTMENTS: TicketDepartment[] = [
  { id: 'dept-1', label: 'ROCKSTAR_ACCOUNT', value: 'ROCKSTAR_ACCOUNT', emoji: '<:MG3_FIVEam:1526256494230896800>', description: 'Rockstar Games & GTA Support' },
  { id: 'dept-2', label: 'SUPPORT AND INQUIRIES', value: 'SUPPORT_AND_INQUIRIES', emoji: '<:SUPPORT_AND_INQUIRIES:1526254958176112892>', description: 'General Support & Inquiries' },
  { id: 'dept-3', label: 'FC', value: 'FC', emoji: '<:MG3_FC:1526259039888212100>', description: 'EA FC & FIFA Services' },
  { id: 'dept-4', label: 'Seller Appeal', value: 'SELLER_APPEL', emoji: '<:MG3_USER_NAME:1523653583319470181>', description: 'Seller Appeal & Partner Requests' },
  { id: 'dept-5', label: 'Buy & Sell', value: 'BUY_SELL', emoji: '<:MG3_PARTNER:1523652769788203039>', description: 'Buying and Selling Requests' },
  { id: 'dept-6', label: 'COD', value: 'COD', emoji: '<:MG3_COD:1523657809810686133>', description: 'Call of Duty Services' },
  { id: 'dept-7', label: 'Overwatch2', value: 'OVERWATCH2', emoji: '<:MG3_overwatch:1523658050181927022>', description: 'Overwatch 2 Services' },
  { id: 'dept-8', label: 'Marvel Rivals', value: 'RIVALS', emoji: '<:MG3_MARVL_RIVELS:1523658151411449896>', description: 'Marvel Rivals Services' },
  { id: 'dept-9', label: 'VALORANT', value: 'VALORANT', emoji: '<:MG3_VALORANT:1523658461735420006>', description: 'Valorant Points & Accounts' },
  { id: 'dept-10', label: 'Rocket League', value: 'ROCKET', emoji: '<:MG3_Rocket_League:1523658298421809213>', description: 'Rocket League Items & Credits' },
  { id: 'dept-11', label: 'ARC Raiders', value: 'ARC', emoji: '<:MG3_ARC_Raiders:1523666892860948520>', description: 'ARC Raiders Support' },
];

function sanitizeValues(raw?: Partial<TicketsFeature>): TicketsFeature {
  let local: Partial<TicketsFeature> = {};
  if (typeof window !== 'undefined') {
    try {
      const rawLocal = localStorage.getItem('mg3_tickets_config');
      if (rawLocal) local = JSON.parse(rawLocal);
    } catch {}
  }

  const merged = { ...raw, ...local };

  const panelChannelId =
    merged.panelChannelId && merged.panelChannelId !== ''
      ? merged.panelChannelId
      : OFFICIAL_PANEL_CHANNEL_ID;

  const categoryId =
    merged.categoryId && merged.categoryId !== '' && merged.categoryId !== 'undefined'
      ? merged.categoryId
      : OFFICIAL_CATEGORY_ID;

  const logChannelId =
    merged.logChannelId &&
    merged.logChannelId !== '' &&
    merged.logChannelId !== '1240011818223796284'
      ? merged.logChannelId
      : OFFICIAL_LOG_CHANNEL_ID;

  const supportRoleId =
    merged.supportRoleId &&
    merged.supportRoleId !== '' &&
    merged.supportRoleId !== '1523666892860948520'
      ? merged.supportRoleId
      : OFFICIAL_SUPPORT_ROLE_ID;

  const ceoRoleId =
    merged.ceoRoleId && merged.ceoRoleId !== ''
      ? merged.ceoRoleId
      : OFFICIAL_CEO_ROLE_ID;

  const embedBannerUrl =
    merged.embedBannerUrl && merged.embedBannerUrl !== 'https://i.imghos.co/MtalsvvN.png'
      ? merged.embedBannerUrl
      : OFFICIAL_BANNER_URL;

  const embedTitle =
    merged.embedTitle && merged.embedTitle !== '🎫 MG3 STORE • SUPPORT TICKETS'
      ? merged.embedTitle
      : OFFICIAL_EMBED_TITLE;

  const embedDescription =
    merged.embedDescription && !merged.embedDescription.includes('MG3 Support Services')
      ? merged.embedDescription
      : '';

  const departments =
    merged.departments && Array.isArray(merged.departments) && merged.departments.length >= 11
      ? merged.departments
      : DEFAULT_DEPARTMENTS;

  return {
    panelChannelId,
    categoryId,
    logChannelId,
    supportRoleId,
    ceoRoleId,
    enableTranscripts: merged.enableTranscripts ?? true,
    enableDmFeedback: merged.enableDmFeedback ?? true,
    embedTitle,
    embedDescription,
    embedColor: merged.embedColor || '#7c3aed',
    embedBannerUrl,
    departments,
  };
}

export const useTicketsFeature: UseFormRender<TicketsFeature> = (
  initial,
  onSubmit
) => {
  const { control, handleSubmit, reset, formState } = useForm<TicketsFeature>({
    defaultValues: sanitizeValues(initial),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departments',
  });

  useEffect(() => {
    if (initial) {
      reset(sanitizeValues(initial));
    }
  }, [initial, reset]);

  const handleSave = async (data: TicketsFeature) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mg3_tickets_config', JSON.stringify(data));
      } catch {}
    }
    const res = await onSubmit(data);
    reset(sanitizeValues(data));
    return res;
  };

  return {
    onSubmit: handleSubmit(handleSave),
    canSave: formState.isDirty,
    reset: () => reset(sanitizeValues(initial)),
    render: (
      <Flex direction="column" gap={6} w="full">
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex={1}>
            <ChannelSelectForm
              control={{ label: 'Ticket Panel Channel', description: 'Channel where the ticket setup embed & dropdown are posted.' }}
              controller={{ control, name: 'panelChannelId' }}
            />
          </Box>
          <Box flex={1}>
            <CategorySelectForm
              control={{ label: 'Tickets Category', description: 'Discord Category under which new ticket channels are created.' }}
              controller={{ control, name: 'categoryId' }}
            />
          </Box>
        </Flex>

        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex={1}>
            <ChannelSelectForm
              control={{ label: 'Ticket Logs Channel', description: 'Channel where closed ticket logs and HTML transcripts are posted.' }}
              controller={{ control, name: 'logChannelId' }}
            />
          </Box>
          <Box flex={1}>
            <RoleSelectForm
              control={{ label: 'Default Support Role', description: 'Staff support role with access to view and claim general tickets.' }}
              controller={{ control, name: 'supportRoleId' }}
            />
          </Box>
        </Flex>

        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex={1}>
            <RoleSelectForm
              control={{ label: 'CEO / Admin Role', description: 'Admin role with full permission to manage, rename, and delete tickets.' }}
              controller={{ control, name: 'ceoRoleId' }}
            />
          </Box>
        </Flex>

        <Box p={6} rounded="2xl" bg="CardBackground" border="1px solid" borderColor="CardBorder">
          <Flex justify="space-between" align="center" mb={5}>
            <Box>
              <Flex align="center" gap={2}>
                <Heading size="md">Ticket Departments & Categories (Custom Select Menu)</Heading>
                <Text fontSize="xs" fontWeight="bold" px={2} py={0.5} rounded="full" bg="purple.500" color="white">
                  {fields.length} DEPARTMENTS
                </Text>
              </Flex>
              <Text fontSize="sm" color="TextSecondary" mt={1}>
                Add, customize, or remove the departments displayed in your Discord ticket select menu.
              </Text>
            </Box>
            <Button
              size="sm"
              leftIcon={<FaPlus />}
              colorScheme="purple"
              variant="solid"
              onClick={() =>
                append({
                  id: `dept-${Date.now()}`,
                  label: '',
                  value: '',
                  emoji: '🎫',
                  description: '',
                  roleId: '',
                  welcomeMessage: '',
                })
              }
            >
              Add Department
            </Button>
          </Flex>

          <Flex direction="column" gap={4}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                p={4}
                rounded="xl"
                bg="Background"
                border="1px solid"
                borderColor="CardBorder"
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Flex align="center" gap={2}>
                    <FaTicketAlt color="#a855f7" />
                    <Text fontWeight="bold" fontSize="sm">
                      Department #{index + 1}: {field.label || field.value || 'New Department'}
                    </Text>
                  </Flex>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <FaTrash />
                  </Button>
                </Flex>

                <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={3}>
                  <Box flex={2}>
                    <InputForm
                      control={{ label: 'Department Label' }}
                      controller={{ control, name: `departments.${index}.label` }}
                    />
                  </Box>
                  <Box flex={1}>
                    <InputForm
                      control={{ label: 'Emoji (Unicode or Custom)' }}
                      controller={{ control, name: `departments.${index}.emoji` }}
                    />
                  </Box>
                  <Box flex={2}>
                    <InputForm
                      control={{ label: 'Identifier (Value)' }}
                      controller={{ control, name: `departments.${index}.value` }}
                    />
                  </Box>
                </Flex>

                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <InputForm
                      control={{ label: 'Description (Sub-label in Dropdown)' }}
                      controller={{ control, name: `departments.${index}.description` }}
                    />
                  </Box>
                  <Box flex={1}>
                    <RoleSelectForm
                      control={{ label: 'Department Support Role (Optional)' }}
                      controller={{ control, name: `departments.${index}.roleId` }}
                    />
                  </Box>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>

        <Box p={6} rounded="2xl" bg="CardBackground" border="1px solid" borderColor="CardBorder">
          <Heading size="md" mb={2}>Custom Discord Embed Message Designer</Heading>
          <Text fontSize="sm" color="TextSecondary" mb={5}>Customize the ticket panel appearance sent to your Discord channel.</Text>

          <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={4}>
            <Box flex={2}>
              <InputForm control={{ label: 'Embed Title' }} controller={{ control, name: 'embedTitle' }} />
            </Box>
            <Box flex={1}>
              <InputForm control={{ label: 'Embed Color (HEX)' }} controller={{ control, name: 'embedColor' }} />
            </Box>
          </Flex>

          <Box mb={4}>
            <InputForm control={{ label: 'Embed Description / Instructions' }} controller={{ control, name: 'embedDescription' }} />
          </Box>

          <Box mb={4}>
            <InputForm control={{ label: 'Embed Banner Image URL' }} controller={{ control, name: 'embedBannerUrl' }} />
          </Box>
        </Box>

        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex={1}>
            <SwitchFieldForm
              control={{ label: 'HTML Transcripts', description: 'Generate full HTML transcript file upon closing tickets.' }}
              controller={{ control, name: 'enableTranscripts' }}
            />
          </Box>
          <Box flex={1}>
            <SwitchFieldForm
              control={{ label: 'DM Feedback Form', description: 'Send direct message feedback rating request to ticket creator on close.' }}
              controller={{ control, name: 'enableDmFeedback' }}
            />
          </Box>
        </Flex>
      </Flex>
    ),
  };
};
