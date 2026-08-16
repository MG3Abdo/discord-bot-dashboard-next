import { Icon } from '@chakra-ui/react';
import { GuildChannel } from '@/api/bot';
import { ChannelTypes } from '@/api/discord';
import { Option, SelectField } from '@/components/forms/SelectField';
import { forwardRef, useMemo } from 'react';
import { useGuildChannelsQuery } from '@/api/hooks';
import { useRouter } from 'next/router';
import { SelectInstance, Props as SelectProps } from 'chakra-react-select';
import { Override } from '@/utils/types';
import { ControlledInput } from './types';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';
import { BsFolderFill } from 'react-icons/bs';

const renderCategoryOption = (category: GuildChannel): Option => {
  return {
    label: `📁 ${category.name}`,
    value: String(category.id),
    icon: <Icon as={BsFolderFill} color="yellow.400" w="18px" h="18px" />,
  };
};

function mapCategoryOptions(channels: GuildChannel[]): Option[] {
  if (!Array.isArray(channels) || channels.length === 0) return [];
  return channels
    .filter((c) => Number(c.type) === ChannelTypes.GUILD_CATEGORY || Number(c.type) === 4)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(renderCategoryOption);
}

type Props = Override<
  SelectProps<Option, false>,
  {
    value?: string;
    onChange: (v: string) => void;
  }
>;

export const CategorySelect = forwardRef<SelectInstance<Option, false>, Props>(
  ({ value, onChange, ...rest }, ref) => {
    const guild = useRouter().query.guild as string;
    const channelsQuery = useGuildChannelsQuery(guild);
    const isLoading = channelsQuery.isLoading;

    const options = useMemo(
      () => (channelsQuery.data != null ? mapCategoryOptions(channelsQuery.data) : []),
      [channelsQuery.data]
    );

    const selected = useMemo(() => {
      if (!value || !channelsQuery.data) return null;
      const found = channelsQuery.data.find(
        (c) =>
          (Number(c.type) === ChannelTypes.GUILD_CATEGORY || Number(c.type) === 4) &&
          String(c.id) === String(value)
      );
      return found != null ? renderCategoryOption(found) : null;
    }, [value, channelsQuery.data]);

    const noOptionsMessage = () => {
      if (channelsQuery.isLoading) return 'Loading categories...';
      if (channelsQuery.isError) {
        const err = channelsQuery.error as Error;
        return err?.message ? `⚠️ ${err.message}` : 'Failed to load categories';
      }
      return 'No categories found';
    };

    const placeholder = channelsQuery.isLoading
      ? 'Loading categories...'
      : channelsQuery.isError
      ? 'Failed to load categories'
      : 'Select a category';

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

CategorySelect.displayName = 'CategorySelect';

export const CategorySelectForm: ControlledInput<Omit<Props, 'value' | 'onChange'>, string | undefined> = ({
  control,
  controller,
  ...props
}) => {
  const { field, fieldState } = useController(controller);

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <CategorySelect {...field} {...props} />
    </FormCard>
  );
};
