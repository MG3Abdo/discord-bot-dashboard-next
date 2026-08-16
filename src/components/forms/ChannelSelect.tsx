import { BsChatLeftText as ChatIcon } from 'react-icons/bs';
import { GuildChannel } from '@/api/bot';
import { ChannelTypes } from '@/api/discord';
import { Option, SelectField } from '@/components/forms/SelectField';
import { forwardRef, useMemo } from 'react';
import { MdRecordVoiceOver, MdCampaign } from 'react-icons/md';
import { useGuildChannelsQuery } from '@/api/hooks';
import { Icon } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { SelectInstance, Props as SelectProps } from 'chakra-react-select';
import { Override } from '@/utils/types';
import { ControlledInput } from './types';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';
import { common } from '@/config/translations/common';

/**
 * Render channel option with appropriate Discord icon
 */
const renderChannelOption = (channel: GuildChannel): Option => {
  const icon = () => {
    switch (Number(channel.type)) {
      case ChannelTypes.GUILD_ANNOUNCEMENT:
        return <Icon as={MdCampaign} color="purple.400" />;
      case ChannelTypes.GUILD_STAGE_VOICE:
      case ChannelTypes.GUILD_VOICE:
        return <Icon as={MdRecordVoiceOver} color="green.400" />;
      default:
        return <Icon as={ChatIcon} color="blue.400" />;
    }
  };

  return {
    label: `# ${channel.name}`,
    value: channel.id,
    icon: icon(),
  };
};

function mapGroupedChannels(channels: GuildChannel[]) {
  if (!Array.isArray(channels) || channels.length === 0) return [];

  const sorted = [...channels].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  // Map categoryId -> category channel
  const categories = new Map<string, GuildChannel>();
  // Map categoryId -> array of child channels
  const categoryChildren = new Map<string, GuildChannel[]>();
  // Standalone channels (no parent category, and not a category itself)
  const standalones: GuildChannel[] = [];

  // Pass 1: Identify all category headers
  for (let i = 0; i < sorted.length; i++) {
    const channel = sorted[i];
    if (Number(channel.type) === ChannelTypes.GUILD_CATEGORY) {
      categories.set(channel.id, channel);
      if (!categoryChildren.has(channel.id)) {
        categoryChildren.set(channel.id, []);
      }
    }
  }

  // Pass 2: Separate selectable channels into category groups or standalone
  for (let i = 0; i < sorted.length; i++) {
    const channel = sorted[i];
    // Categories themselves are not selectable as text channels
    if (Number(channel.type) === ChannelTypes.GUILD_CATEGORY) continue;

    const parentId = channel.parent_id || channel.category;
    if (parentId && categories.has(parentId)) {
      const list = categoryChildren.get(parentId) || [];
      list.push(channel);
      categoryChildren.set(parentId, list);
    } else {
      standalones.push(channel);
    }
  }

  const result: any[] = [];

  // Standalone channels first
  for (let i = 0; i < standalones.length; i++) {
    result.push(renderChannelOption(standalones[i]));
  }

  // Grouped channels under their categories
  categories.forEach((catChannel, catId) => {
    const children = categoryChildren.get(catId) || [];
    if (children.length > 0) {
      result.push({
        label: `📂 ${catChannel.name.toUpperCase()}`,
        options: children.map(renderChannelOption),
      });
    }
  });

  // Fallback if no categories matched
  if (result.length === 0) {
    return sorted
      .filter((c) => Number(c.type) !== ChannelTypes.GUILD_CATEGORY)
      .map(renderChannelOption);
  }

  return result;
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

    const selected = useMemo(() => {
      if (!value || !channelsQuery.data) return null;
      const found = channelsQuery.data.find((c) => c.id === value);
      return found != null ? renderChannelOption(found) : null;
    }, [value, channelsQuery.data]);

    const options = useMemo(
      () => (channelsQuery.data != null ? mapGroupedChannels(channelsQuery.data) : []),
      [channelsQuery.data]
    );

    return (
      <SelectField<Option>
        isDisabled={isLoading}
        isLoading={isLoading}
        placeholder={isLoading ? 'Loading channels...' : <common.T text="select channel" />}
        noOptionsMessage={() => (isLoading ? 'Loading channels...' : 'No channels found')}
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
