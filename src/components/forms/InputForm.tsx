import { Input, InputProps } from '@chakra-ui/react';
import { FormCard } from './Form';
import { ControlledInput, WithControl } from './types';
import { useController } from 'react-hook-form';

export type InputFormProps = WithControl<InputProps>;

export const InputForm: ControlledInput<InputProps, string | undefined> = ({
  control,
  controller,
  ...props
}) => {
  const { fieldState, field } = useController(controller);

  return (
    <FormCard {...control} error={fieldState?.error?.message}>
      <Input variant="main" {...field} value={field.value ?? ''} {...props} />
    </FormCard>
  );
};
