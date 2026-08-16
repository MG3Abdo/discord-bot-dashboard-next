import { Center, Flex, Heading, SimpleGrid, Text, Button, Icon, HStack } from '@chakra-ui/react';
import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { QueryStatus } from '@/components/panel/QueryPanel';
import { config } from '@/config/common';
import { guild as view } from '@/config/translations/guild';
import { BsMailbox } from 'react-icons/bs';
import { FaRobot, FaRedo } from 'react-icons/fa';
import { useGuildInfoQuery } from '@/api/hooks';
import { useRouter } from 'next/router';
import { getFeatures } from '@/utils/common';
import { Banner } from '@/components/GuildBanner';
import { FeatureItem } from '@/components/feature/FeatureItem';
import type { CustomGuildInfo } from '@/config/types/custom-types';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

const GuildPage: NextPageWithLayout = () => {
  const t = view.useTranslations();
  const guild = useRouter().query.guild as string;
  const query = useGuildInfoQuery(guild);

  return (
    <QueryStatus query={query} loading={<LoadingPanel />} error={t.error.load}>
      {query.data != null ? (
        <GuildPanel guild={guild} info={query.data} />
      ) : (
        <NotJoined guild={guild} onRefresh={() => query.refetch()} />
      )}
    </QueryStatus>
  );
};

function GuildPanel({ guild: id, info }: { guild: string; info: CustomGuildInfo }) {
  const t = view.useTranslations();

  return (
    <Flex direction="column" gap={5}>
      <Banner />
      <Flex direction="column" gap={5} mt={3}>
        <Heading size="md">{t.features}</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, '2xl': 3 }} gap={3}>
          {getFeatures().map((feature) => (
            <FeatureItem
              key={feature.id}
              guild={id}
              feature={feature}
              enabled={info.enabledFeatures?.includes(feature.id) ?? false}
            />
          ))}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
}

function NotJoined({ guild, onRefresh }: { guild: string; onRefresh: () => void }) {
  const t = view.useTranslations();

  return (
    <Center flexDirection="column" gap={4} h="full" minH="350px" p={5}>
      <Icon as={BsMailbox} w={50} h={50} color="Brand" />
      <Text fontSize="xl" fontWeight="600">
        {t.error['not found']}
      </Text>
      <Text textAlign="center" color="TextSecondary" maxW="420px">
        {t.error['not found description']}
      </Text>
      <HStack spacing={3} mt={2}>
        <Button
          variant="action"
          leftIcon={<FaRobot />}
          px={6}
          as="a"
          href={`${config.inviteUrl}&guild_id=${guild}`}
          target="_blank"
        >
          {t.bn.invite}
        </Button>
        <Button
          variant="primary"
          leftIcon={<FaRedo />}
          onClick={onRefresh}
          px={5}
        >
          Check Again
        </Button>
      </HStack>
    </Center>
  );
}

GuildPage.getLayout = (c) => getGuildLayout({ children: c });
export default GuildPage;
