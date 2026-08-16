import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Center,
  Circle,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  Spacer,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { config } from '@/config/common';
import { useGuilds } from '@/api/hooks';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { iconUrl } from '@/api/discord';
import { dashboard } from '@/config/translations/dashboard';
import Link from 'next/link';
import { FaRobot, FaServer } from 'react-icons/fa';
import { IoOpen, IoShieldCheckmark } from 'react-icons/io5';
import { MdMessage, MdSecurity, MdSpeed } from 'react-icons/md';
import { FiArrowRight, FiUser } from 'react-icons/fi';

const HomePage: NextPageWithLayout = () => {
  const t = dashboard.useTranslations();

  return (
    <Flex direction="column" gap={6} maxW="1400px" mx="auto" w="full" pb={10}>
      {/* Hero / Banner */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'start', md: 'center' }}
        justifyContent="space-between"
        rounded="2xl"
        bg="Brand"
        p={{ base: 6, md: 8 }}
        gap={6}
        shadow="md"
      >
        <HStack spacing={5} align="center">
          <Circle
            size="72px"
            bg="whiteAlpha.200"
            color="white"
            display={{ base: 'none', sm: 'flex' }}
            shadow="lg"
          >
            <Icon as={FaRobot} w={9} h={9} />
          </Circle>
          <VStack align="start" spacing={1}>
            <HStack>
              <Heading color="white" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                {t.hero.title}
              </Heading>
              <Badge colorScheme="green" px={2} py={0.5} rounded="md" fontSize="xs">
                Online
              </Badge>
            </HStack>
            <Text color="whiteAlpha.900" fontSize={{ base: 'sm', md: 'md' }}>
              {t.hero.description}
            </Text>
          </VStack>
        </HStack>

        <ButtonGroup spacing={3} flexWrap="wrap">
          <Button
            as="a"
            href={config.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="white"
            bg="whiteAlpha.300"
            _hover={{ bg: 'whiteAlpha.400' }}
            _active={{ bg: 'whiteAlpha.500' }}
            leftIcon={<IoOpen />}
            size="md"
            rounded="xl"
          >
            {t.hero.invite_bn}
          </Button>
          <Button
            as={Link}
            href="/user/profile"
            bg="white"
            color="brand.600"
            _hover={{ bg: 'whiteAlpha.900' }}
            _active={{ bg: 'whiteAlpha.800' }}
            leftIcon={<FiUser />}
            size="md"
            rounded="xl"
          >
            {t.hero.profile_bn}
          </Button>
        </ButtonGroup>
      </Flex>

      {/* Server Selector Section */}
      <Flex direction="column" gap={2} mt={2}>
        <HStack>
          <Icon as={FaServer} color="Brand" w={5} h={5} />
          <Heading size="md" fontWeight="bold">
            {t.servers.title}
          </Heading>
        </HStack>
        <Text color="TextSecondary" fontSize="sm">
          {t.servers.description}
        </Text>
      </Flex>

      {/* Guild Grid */}
      <GuildSelect />

      {/* Features Overview */}
      <Flex direction="column" gap={2} mt={6}>
        <Heading size="md" fontWeight="bold">
          {t.features_overview.title}
        </Heading>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <Card variant="primary" rounded="2xl" p={2}>
          <CardBody as={VStack} align="start" spacing={3}>
            <Circle size="48px" bg="brandAlpha.100" color="Brand">
              <Icon as={MdMessage} w={6} h={6} />
            </Circle>
            <Heading size="sm">{t.features_overview.welcome_title}</Heading>
            <Text color="TextSecondary" fontSize="sm">
              {t.features_overview.welcome_desc}
            </Text>
          </CardBody>
        </Card>

        <Card variant="primary" rounded="2xl" p={2}>
          <CardBody as={VStack} align="start" spacing={3}>
            <Circle size="48px" bg="green.50" _dark={{ bg: 'green.900' }} color="green.500">
              <Icon as={MdSecurity} w={6} h={6} />
            </Circle>
            <Heading size="sm">{t.features_overview.roles_title}</Heading>
            <Text color="TextSecondary" fontSize="sm">
              {t.features_overview.roles_desc}
            </Text>
          </CardBody>
        </Card>

        <Card variant="primary" rounded="2xl" p={2}>
          <CardBody as={VStack} align="start" spacing={3}>
            <Circle size="48px" bg="purple.50" _dark={{ bg: 'purple.900' }} color="purple.500">
              <Icon as={MdSpeed} w={6} h={6} />
            </Circle>
            <Heading size="sm">{t.features_overview.commands_title}</Heading>
            <Text color="TextSecondary" fontSize="sm">
              {t.features_overview.commands_desc}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Flex>
  );
};

export function GuildSelect() {
  const t = dashboard.useTranslations();
  const guilds = useGuilds();

  if (guilds.status === 'loading') {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        <Skeleton minH="100px" rounded="2xl" />
        <Skeleton minH="100px" rounded="2xl" />
        <Skeleton minH="100px" rounded="2xl" />
      </SimpleGrid>
    );
  }

  if (guilds.status === 'error') {
    return (
      <Card variant="primary" rounded="2xl" p={6}>
        <CardBody as={VStack} spacing={4} align="center">
          <Text color="TextSecondary" textAlign="center">
            Failed to load servers. Please try again.
          </Text>
          <Button variant="danger" size="sm" rounded="xl" onClick={() => guilds.refetch()}>
            {t.servers.try_again}
          </Button>
        </CardBody>
      </Card>
    );
  }

  const manageableGuilds = guilds.data?.filter((guild) => config.guild.filter(guild)) ?? [];

  if (manageableGuilds.length === 0) {
    return (
      <Card variant="primary" rounded="2xl" p={8}>
        <CardBody as={VStack} spacing={4} align="center" textAlign="center">
          <Circle size="60px" bg="brandAlpha.100" color="Brand">
            <Icon as={FaServer} w={7} h={7} />
          </Circle>
          <Heading size="sm">{t.servers.no_servers}</Heading>
          <Text color="TextSecondary" fontSize="sm" maxW="450px">
            {t.servers.no_servers_desc}
          </Text>
          <Button
            as="a"
            href={config.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="action"
            size="sm"
            rounded="xl"
            leftIcon={<IoOpen />}
          >
            {t.servers.invite_prompt}
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
      {manageableGuilds.map((guild) => (
        <Card
          key={guild.id}
          variant="primary"
          as={Link}
          href={`/guilds/${guild.id}`}
          rounded="2xl"
          cursor="pointer"
          transition="all 0.2s ease-in-out"
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'lg',
            borderColor: 'Brand',
          }}
          p={1}
        >
          <CardBody as={Flex} alignItems="center" gap={4} p={4}>
            <Avatar
              src={iconUrl(guild)}
              name={guild.name}
              size="md"
              rounded="xl"
              border="2px solid"
              borderColor="whiteAlpha.300"
            />
            <Box flex={1} minW={0}>
              <Text fontWeight="bold" fontSize="md" isTruncated>
                {guild.name}
              </Text>
              <HStack spacing={1} mt={0.5}>
                <Icon as={IoShieldCheckmark} color="green.500" w={3.5} h={3.5} />
                <Text fontSize="xs" color="TextSecondary">
                  Administrator
                </Text>
              </HStack>
            </Box>
            <Button
              size="xs"
              variant="action"
              rounded="lg"
              rightIcon={<FiArrowRight />}
              pointerEvents="none"
            >
              {t.servers.manage}
            </Button>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}

HomePage.getLayout = (c) => <AppLayout>{c}</AppLayout>;
export default HomePage;
