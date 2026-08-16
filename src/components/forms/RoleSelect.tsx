import { Icon, Image } from '@chakra-ui/react';
import { useGuildRolesQuery } from '@/api/hooks';
import { Option, SelectField } from '@/components/forms/SelectField';
import { toRGB } from '@/utils/common';
import { Role } from '@/api/bot';
import { useRouter } from 'next/router';
import { forwardRef, useMemo } from 'react';
import { SelectInstance, Props as SelectProps } from 'chakra-react-select';
import { Override } from '@/utils/types';
import { ControlledInput } from './types';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';
import { common } from '@/config/translations/common';
import { BsPeopleFill } from 'react-icons/bs';

type Props = Override<
  SelectProps<Option, false>,
  {
    value?: string;
    onChange: (role: string) => void;
  }
>;

function renderRoleOption(role: Role): Option {
  const color = role.color && role.color !== 0 ? toRGB(role.color) : 'inherit';
  return {
    value: role.id,
    label: `@ ${role.name}`,
    icon:
      role.icon?.iconUrl != null ? (
        <Image alt="icon" src={role.icon.iconUrl} bg={color} w="22px" h="22px" rounded="full" />
      ) : (
        <Icon as={BsPeopleFill} color={color} w="18px" h="18px" />
      ),
  };
}

export const RoleSelect = forwardRef<SelectInstance<Option, false>, Props>((props, ref) => {
  const { value, onChange, ...rest } = props;
  const guild = useRouter().query.guild as string;
  const rolesQuery = useGuildRolesQuery(guild);
  const isLoading = rolesQuery.isLoading;

  const validRoles = useMemo(() => {
    if (!rolesQuery.data || !Array.isArray(rolesQuery.data)) return [];
    return rolesQuery.data.filter((r) => r.id !== guild && r.name !== '@everyone');
  }, [rolesQuery.data, guild]);

  const selected = useMemo(() => {
    if (!value || !rolesQuery.data) return null;
    const found = rolesQuery.data.find((role) => role.id === value);
    return found != null ? renderRoleOption(found) : null;
  }, [value, rolesQuery.data]);

  const options = useMemo(() => validRoles.map(renderRoleOption), [validRoles]);

  return (
    <SelectField<Option>
      isDisabled={isLoading}
      isLoading={isLoading}
      placeholder={isLoading ? 'Loading roles...' : <common.T text="select role" />}
      noOptionsMessage={() => (isLoading ? 'Loading roles...' : 'No roles found')}
      value={selected}
      onChange={(e) => e != null && onChange(e.value)}
      options={options}
      ref={ref}
      {...rest}
    />
  );
});

RoleSelect.displayName = 'RolesSelect';

export const RoleSelectForm: ControlledInput<Omit<Props, 'value' | 'onChange'>, string | undefined> = ({
  control,
  controller,
  ...props
}) => {
  const { fieldState, field } = useController(controller);

  return (
    <FormCard {...control} error={fieldState?.error?.message}>
      <RoleSelect {...field} {...props} />
    </FormCard>
  );
};
