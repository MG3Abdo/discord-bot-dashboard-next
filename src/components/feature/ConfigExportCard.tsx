import { Box, Button, Flex, Heading, Text, useClipboard, useToast } from '@chakra-ui/react';
import { BsCheck2, BsClipboard } from 'react-icons/bs';

interface Props {
  title: string;
  description?: string;
  configText: string;
}

export function ConfigExportCard({ title, description, configText }: Props) {
  const { hasCopied, onCopy } = useClipboard(configText);
  const toast = useToast();

  const handleCopy = () => {
    onCopy();
    toast({
      title: 'Configuration Copied',
      description: 'Guild configuration copied to clipboard!',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  return (
    <Box
      bg="CardBackground"
      p={5}
      rounded="2xl"
      shadow="normal"
      border="1px solid"
      borderColor="InputBorder"
      mt={4}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Box>
          <Heading size="sm" fontWeight="600">
            {title}
          </Heading>
          {description && (
            <Text fontSize="xs" color="TextSecondary" mt={1}>
              {description}
            </Text>
          )}
        </Box>
        <Button
          size="sm"
          variant="action"
          leftIcon={hasCopied ? <BsCheck2 /> : <BsClipboard />}
          onClick={handleCopy}
        >
          {hasCopied ? 'Copied' : 'Copy Config'}
        </Button>
      </Flex>
      <Box
        as="pre"
        p={3}
        bg="InputBackground"
        rounded="xl"
        fontSize="xs"
        fontFamily="mono"
        overflowX="auto"
        maxH="220px"
        color="TextPrimary"
      >
        {configText}
      </Box>
    </Box>
  );
}
