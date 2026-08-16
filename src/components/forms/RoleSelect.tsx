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
    value: String(role.id),
    label: `@${role.name}`,
    icon:
      role.icon?.iconUrl != null ? (
        <Image alt="icon" src={role.icon.iconUrl} bg={color} w="22px" h="22px" rounded="full" />
      ) : (
        <Icon as={BsPeopleFill} color={color} w="18px" h="18px" />
      ),
  };
}

function mapRoleOptions(roles: Role[], guildId: string): Option[] {
  if (!Array.isArray(roles) || roles.length === 0) return [];
  return roles
    .filter((r) => String(r.id) !== String(guildId) && r.name !== '@everyone')
    .sort((a, b) => (b.position ?? 0) - (a.position ?? 0))
    .map(renderRoleOption);
}

export const RoleSelect = forwardRef<SelectInstance<Option, false>, Props>((props, ref) => {
  const { value, onChange, ...rest } = props;
  const guild = useRouter().query.guild as string;
  const rolesQuery = useGuildRolesQuery(guild);
  const isLoading = rolesQuery.isLoading;

  const options = useMemo(
    () => (rolesQuery.data != null ? mapRoleOptions(rolesQuery.data, guild) : []),
    [rolesQuery.data, guild]
  );

  const selected = useMemo(() => {
    if (!value || !rolesQuery.data) return null;
    const found = rolesQuery.data.find((role) => String(role.id) === String(value));
    return found != null ? renderRoleOption(found) : null;
  }, [value, rolesQuery.data]);

  const noOptionsMessage = () => {
    if (rolesQuery.isLoading) return 'Loading roles...';
    if (rolesQuery.isError) {
      const err = rolesQuery.error as Error;
      return err?.message ? `⚠️ ${err.message}` : 'Failed to load roles';
    }
    return 'No roles found';
  };

  const placeholder = rolesQuery.isLoading
    ? 'Loading roles...'
    : rolesQuery.isError
    ? 'Failed to load roles'
    : 'Select a role';

  return (
    <SelectField<Option>
      isDisabled={isLoading}
      isLoading={isLoading}
      placeholder={placeholder}
      noOptionsMessage={noOptionsMessage}
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
