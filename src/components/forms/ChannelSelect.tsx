import { BsChatLeftText as ChatIcon } from 'react-icons/bs';
import { GuildChannel } from '@/api/bot';
import { ChannelTypes } from '@/api/discord';
import { Option, SelectField } from '@/components/forms/SelectField';
import { forwardRef, useMemo } from 'react';
import { MdCampaign, MdForum } from 'react-icons/md';
import { useGuildChannelsQuery } from '@/api/hooks';
import { Icon } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { SelectInstance, Props as SelectProps } from 'chakra-react-select';
import { Override } from '@/utils/types';
import { ControlledInput } from './types';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';

/**
 * Render channel option with appropriate Discord icon
 */
const renderChannelOption = (channel: GuildChannel, categoryName?: string): Option => {
  const icon = () => {
    switch (Number(channel.type)) {
      case ChannelTypes.GUILD_ANNOUNCEMENT:
      case 5:
        return <Icon as={MdCampaign} color="purple.400" w="18px" h="18px" />;
      case ChannelTypes.GUILD_FORUM:
      case 15:
        return <Icon as={MdForum} color="teal.400" w="18px" h="18px" />;
      default:
        return <Icon as={ChatIcon} color="blue.400" w="18px" h="18px" />;
    }
  };

  const label = categoryName ? `[${categoryName}] #${channel.name}` : `#${channel.name}`;

  return {
    label,
    value: String(channel.id),
    icon: icon(),
  };
};

function mapChannelOptions(channels: GuildChannel[]): Option[] {
  if (!Array.isArray(channels) || channels.length === 0) return [];

  // Build category map (id -> category name)
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < channels.length; i++) {
    if (Number(channels[i].type) === ChannelTypes.GUILD_CATEGORY || Number(channels[i].type) === 4) {
      categoryMap.set(String(channels[i].id), channels[i].name);
    }
  }

  // Filter for message-capable text channels (Text: 0, Announcement: 5, Forum: 15)
  // Exclude Voice (2, 13) and Categories (4)
  const textChannels = channels.filter((c) => {
    const t = Number(c.type);
    return (
      t === ChannelTypes.GUILD_TEXT ||
      t === ChannelTypes.GUILD_ANNOUNCEMENT ||
      t === ChannelTypes.GUILD_FORUM ||
      t === 0 ||
      t === 5 ||
      t === 15
    );
  });

  // Fallback: If no strict text channels match, use any non-category channel
  const list = textChannels.length > 0
    ? textChannels
    : channels.filter((c) => Number(c.type) !== ChannelTypes.GUILD_CATEGORY && Number(c.type) !== 4);

  return list
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((c) => {
      const parentId = c.parent_id || c.category;
      const catName = parentId ? categoryMap.get(String(parentId)) : undefined;
      return renderChannelOption(c, catName);
    });
}

type Props = Override<
  SelectProps<Option, false>,
  {
    value?: string;
    onChange: (v: string) => void;
  }
>;

export const ChannelSelect = forwardRef<SelectInstance<Option, false>, Props>(
  ({ value, onChange, ...rest }, ref) => {
    const guild = useRouter().query.guild as string;
    const channelsQuery = useGuildChannelsQuery(guild);
    const isLoading = channelsQuery.isLoading;

    const options = useMemo(
      () => (channelsQuery.data != null ? mapChannelOptions(channelsQuery.data) : []),
      [channelsQuery.data]
    );

    const selected = useMemo(() => {
      if (!value || !channelsQuery.data) return null;
      const found = channelsQuery.data.find((c) => String(c.id) === String(value));
      if (!found) return null;

      const parentId = found.parent_id || found.category;
      const categoryMap = new Map<string, string>();
      channelsQuery.data.forEach((c) => {
        if (Number(c.type) === ChannelTypes.GUILD_CATEGORY || Number(c.type) === 4) {
          categoryMap.set(String(c.id), c.name);
        }
      });
      return renderChannelOption(found, parentId ? categoryMap.get(String(parentId)) : undefined);
    }, [value, channelsQuery.data]);

    const noOptionsMessage = () => {
      if (channelsQuery.isLoading) return 'Loading channels...';
      if (channelsQuery.isError) {
        const err = channelsQuery.error as Error;
        return err?.message ? `⚠️ ${err.message}` : 'Failed to load channels';
      }
      return 'No channels found';
    };

    const placeholder = channelsQuery.isLoading
      ? 'Loading channels...'
      : channelsQuery.isError
      ? 'Failed to load channels'
      : 'Select a channel';

    return (
      <SelectField<Option>
        isDisabled={isLoading}
        isLoading={isLoading}
        placeholder={placeholder}
        noOptionsMessage={noOptionsMessage}
        value={selected}
        options={options}
        onChange={(e) => e != null && onChange(e.value)}
        ref={ref}
        {...rest}
      />
    );
  }
);

ChannelSelect.displayName = 'ChannelSelect';

export const ChannelSelectForm: ControlledInput<Omit<Props, 'value' | 'onChange'>, string | undefined> = ({
  control,
  controller,
  ...props
}) => {
  const { field, fieldState } = useController(controller);

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <ChannelSelect {...field} {...props} />
    </FormCard>
  );
};
