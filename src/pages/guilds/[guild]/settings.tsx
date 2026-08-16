import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/layout';
import { RoleSelectForm } from '@/components/forms/RoleSelect';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { InputForm } from '@/components/forms/InputForm';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';

const schema = z.object({
  beta: z.boolean(),
  role: z.string().optional(),
  prefix: z.string().min(1).max(5),
  channel: z.string().optional(),
});

type ExampleSettings = z.infer<typeof schema>;

const GuildSettingsPage: NextPageWithLayout = () => {
  const { watch, control, handleSubmit } = useForm<ExampleSettings>({
    resolver: zodResolver(schema),
    defaultValues: {
      beta: true,
      prefix: '/',
      role: undefined,
      channel: undefined,
    },
  });

  return (
    <Flex direction="column">
      <Box ml={{ '3sm': 5 }}>
        <Heading fontSize="2xl" fontWeight="600">
          Guild Settings
        </Heading>
        <Text
          fontSize="lg"
          fontWeight="500"
          as="code"
          _light={{ color: 'cyan.500' }}
          _dark={{ color: 'cyan.400' }}
          cursor="pointer"
          onClick={handleSubmit(() => console.log('submit'))}
        >
          {JSON.stringify(watch())}
        </Text>
      </Box>
      <SimpleGrid mt={5} columns={{ base: 1, md: 2 }} gap={3}>
        <SwitchFieldForm
          control={{
            label: 'Beta Features',
            description: 'Use beta features before releasing',
          }}
          controller={{ control, name: 'beta' }}
        />
        <RoleSelectForm
          control={{
            label: 'Admin Role',
            description: 'Roles able to configure the bot',
          }}
          controller={{ control, name: 'role' }}
        />
        <InputForm
          control={{
            label: 'Command prefix',
            description: 'Change the default command prefix',
          }}
          controller={{ control, name: 'prefix' }}
          placeholder="/"
        />
        <ChannelSelectForm
          control={{
            label: 'Logs',
            description: 'The channel to log bot states',
          }}
          controller={{ control, name: 'channel' }}
        />
      </SimpleGrid>
    </Flex>
  );
};

GuildSettingsPage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default GuildSettingsPage;
