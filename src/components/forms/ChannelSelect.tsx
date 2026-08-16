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
const renderChannelOption = (channel: GuildChannel, categoryName?: string): Option => {
  const icon = () => {
    switch (Number(channel.type)) {
      case ChannelTypes.GUILD_ANNOUNCEMENT:
        return <Icon as={MdCampaign} color="purple.400" w="18px" h="18px" />;
      case ChannelTypes.GUILD_STAGE_VOICE:
      case ChannelTypes.GUILD_VOICE:
        return <Icon as={MdRecordVoiceOver} color="green.400" w="18px" h="18px" />;
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

  // Build category map
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < channels.length; i++) {
    if (Number(channels[i].type) === ChannelTypes.GUILD_CATEGORY) {
      categoryMap.set(String(channels[i].id), channels[i].name);
    }
  }

  // Filter out category channels themselves (they are not selectable as message channels)
  const selectableChannels = channels.filter(
    (c) => Number(c.type) !== ChannelTypes.GUILD_CATEGORY
  );

  return selectableChannels.map((c) => {
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
        if (Number(c.type) === ChannelTypes.GUILD_CATEGORY) {
          categoryMap.set(String(c.id), c.name);
        }
      });
      return renderChannelOption(found, parentId ? categoryMap.get(String(parentId)) : undefined);
    }, [value, channelsQuery.data]);

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
