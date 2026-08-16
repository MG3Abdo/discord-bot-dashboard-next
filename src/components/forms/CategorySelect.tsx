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

const renderCategory = (category: GuildChannel): Option => {
  return {
    label: category.name,
    value: category.id,
    icon: <Icon as={BsFolderFill} color="yellow.400" w="18px" h="18px" />,
  };
};

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

    const categories = useMemo(() => {
      if (!channelsQuery.data || !Array.isArray(channelsQuery.data)) return [];
      return channelsQuery.data
        .filter((c) => Number(c.type) === ChannelTypes.GUILD_CATEGORY)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }, [channelsQuery.data]);

    const selected = value != null ? categories.find((c) => c.id === value) : null;
    const options = useMemo(() => categories.map(renderCategory), [categories]);

    return (
      <SelectField<Option>
        isDisabled={isLoading}
        isLoading={isLoading}
        placeholder={isLoading ? 'Loading categories...' : 'Select a category'}
        noOptionsMessage={() => (isLoading ? 'Loading categories...' : 'No categories found')}
        value={selected != null ? renderCategory(selected) : null}
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
