import { RiErrorWarningFill as WarningIcon } from 'react-icons/ri';
import { Box, Flex, Heading, Spacer, Text } from '@chakra-ui/layout';
import { ButtonGroup, Button, Icon, useToast, Badge } from '@chakra-ui/react';
import { SlideFade } from '@chakra-ui/react';
import { FeatureConfig, UseFormRenderResult, CustomFeatures } from '@/config/types';
import { IoSave } from 'react-icons/io5';
import { useEnableFeatureMutation, useGuildInfoQuery, useUpdateFeatureMutation } from '@/api/hooks';
import { Params } from '@/pages/guilds/[guild]/features/[feature]';
import { feature as view } from '@/config/translations/feature';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsXCircleFill, BsSendFill } from 'react-icons/bs';

export function UpdateFeaturePanel({
  feature,
  config,
}: {
  feature: CustomFeatures[keyof CustomFeatures];
  config: FeatureConfig<keyof CustomFeatures>;
}) {
  const { guild, feature: featureId } = useRouter().query as Params;
  const toast = useToast();
  const mutation = useUpdateFeatureMutation();
  const enableMutation = useEnableFeatureMutation();
  const guildInfoQuery = useGuildInfoQuery(guild);

  const isEnabledInServer = guildInfoQuery.data?.enabledFeatures?.includes(featureId) ?? true;
  const [isEnabled, setIsEnabled] = useState<boolean>(isEnabledInServer);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (guildInfoQuery.data?.enabledFeatures) {
      setIsEnabled(guildInfoQuery.data.enabledFeatures.includes(featureId));
    }
  }, [guildInfoQuery.data?.enabledFeatures, featureId]);

  const result = config.useRender(feature, async (data) => {
    try {
      const res = await mutation.mutateAsync({
        guild,
        feature: featureId,
        options: data,
      });

      toast({
        title: 'Changes Saved',
        description: `${config.name} configuration saved successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });

      return res;
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Could not save configuration.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
      throw err;
    }
  });

  const onToggle = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    try {
      await enableMutation.mutateAsync({
        enabled: nextState,
        guild,
        feature: featureId,
      });

      toast({
        title: nextState ? 'Feature Enabled' : 'Feature Disabled',
        description: `${config.name} is now ${nextState ? 'active' : 'disabled'} for this server.`,
        status: nextState ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    } catch (err) {
      setIsEnabled(!nextState);
      toast({
        title: 'Action Failed',
        description: 'Could not update feature status on the server.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  const onPublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/bot/guild/${guild}/features/${featureId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send panel to Discord');
      }
      toast({
        title: '🚀 Panel Sent to Discord!',
        description: `Successfully published ${config.name} interactive embed to your Discord channel.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'bottom-right',
      });
    } catch (err: any) {
      toast({
        title: 'Publish Failed',
        description: err?.message || 'Please select a channel and click Save first.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Flex direction="column" gap={5} w="full" h="full">
      <Flex direction={{ base: 'column', md: 'row' }} mx={{ '3sm': 5 }} justify="space-between" align={{ md: 'center' }}>
        <Box>
          <Flex align="center" gap={3}>
            <Heading fontSize="2xl" fontWeight="600">
              {config.name}
            </Heading>
            <Badge
              colorScheme={isEnabled ? 'green' : 'red'}
              px={2.5}
              py={0.5}
              rounded="full"
              fontSize="xs"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Icon as={isEnabled ? BsCheckCircleFill : BsXCircleFill} />
              {isEnabled ? 'ENABLED' : 'DISABLED'}
            </Badge>
          </Flex>
          <Text color="TextSecondary" mt={1}>{config.description}</Text>
        </Box>
        <ButtonGroup mt={{ base: 3, md: 0 }} spacing={3}>
          {isEnabled && (
            <Button
              variant="action"
              colorScheme="purple"
              isLoading={isPublishing}
              onClick={onPublish}
              leftIcon={<Icon as={BsSendFill} />}
              px={5}
              rounded="xl"
            >
              Send to Discord
            </Button>
          )}
          <Button
            variant={isEnabled ? 'danger' : 'action'}
            colorScheme={isEnabled ? 'red' : 'green'}
            isLoading={enableMutation.isLoading}
            onClick={onToggle}
            px={6}
            rounded="xl"
          >
            {isEnabled ? <view.T text={(e) => e.bn.disable} /> : <view.T text={(e) => e.bn.enable} />}
          </Button>
        </ButtonGroup>
      </Flex>

      {!isEnabled && (
        <Box
          p={4}
          bg="orange.900"
          border="1px solid"
          borderColor="orange.500"
          rounded="2xl"
          mx={{ '3sm': 5 }}
        >
          <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
            <Text color="orange.100" fontSize="sm" fontWeight="500">
              ⚠️ This feature is currently disabled for this server. Click &quot;Enable&quot; to activate it.
            </Text>
            <Button
              size="sm"
              colorScheme="green"
              onClick={onToggle}
              isLoading={enableMutation.isLoading}
              rounded="lg"
            >
              Enable Now
            </Button>
          </Flex>
        </Box>
      )}

      {result.component}
      <Savebar isLoading={mutation.isLoading} result={result} />
    </Flex>
  );
}

function Savebar({
  result: { canSave, onSubmit, reset },
  isLoading,
}: {
  result: UseFormRenderResult;
  isLoading: boolean;
}) {
  const t = view.useTranslations();
  const breakpoint = '3sm';

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await onSubmit();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDiscard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    reset?.();
  };

  return (
    <Flex
      as={SlideFade}
      in={canSave}
      bg="CardBackground"
      rounded="3xl"
      zIndex="sticky"
      pos="sticky"
      bottom={{ base: 2, [breakpoint]: '10px' }}
      w="full"
      p={{ base: 1, [breakpoint]: '15px' }}
      shadow="normal"
      alignItems="center"
      flexDirection={{ base: 'column', [breakpoint]: 'row' }}
      gap={{ base: 1, [breakpoint]: 2 }}
      mt="auto"
    >
      <Icon
        display={{ base: 'none', [breakpoint]: 'block' }}
        as={WarningIcon}
        _light={{ color: 'orange.400' }}
        _dark={{ color: 'orange.300' }}
        w="30px"
        h="30px"
      />
      <Text fontSize={{ base: 'md', [breakpoint]: 'lg' }} fontWeight="600">
        {t.unsaved}
      </Text>
      <Spacer />
      <ButtonGroup isDisabled={isLoading} size={{ base: 'sm', [breakpoint]: 'md' }}>
        <Button
          type="button"
          variant="action"
          rounded="full"
          leftIcon={<IoSave />}
          isLoading={isLoading}
          onClick={handleSave}
        >
          {t.bn.save}
        </Button>
        <Button type="button" rounded="full" onClick={handleDiscard}>
          {t.bn.discard}
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
