import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { InputForm } from '@/components/forms/InputForm';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { PaymentFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const usePaymentFeature: UseFormRender<PaymentFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<PaymentFeature>({
    defaultValues: {
      vodafoneCashNumber: initial?.vodafoneCashNumber ?? '',
      instapayUsername: initial?.instapayUsername ?? '',
      paypalEmail: initial?.paypalEmail ?? '',
      binanceId: initial?.binanceId ?? '',
      receiptLogChannelId: initial?.receiptLogChannelId ?? '',
      enableAutoConfirm: initial?.enableAutoConfirm ?? false,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        vodafoneCashNumber: initial.vodafoneCashNumber ?? '',
        instapayUsername: initial.instapayUsername ?? '',
        paypalEmail: initial.paypalEmail ?? '',
        binanceId: initial.binanceId ?? '',
        receiptLogChannelId: initial.receiptLogChannelId ?? '',
        enableAutoConfirm: initial.enableAutoConfirm ?? false,
      });
    }
  }, [initial, reset]);

  const values = watch();

  const exportText = `// MG3 Store Payment Gateway Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  VODAFONE_CASH_NUMBER: '${values.vodafoneCashNumber || ''}',
  INSTAPAY_USERNAME: '${values.instapayUsername || ''}',
  PAYPAL_EMAIL: '${values.paypalEmail || ''}',
  BINANCE_PAY_ID: '${values.binanceId || ''}',
  PAYMENT_RECEIPTS_LOG_CHANNEL_ID: '${values.receiptLogChannelId || ''}',
  AUTO_CONFIRM_ORDERS: ${values.enableAutoConfirm ? 'true' : 'false'}
};`;

  const onFormSubmit = async (data: PaymentFeature) => {
    await onSubmit(JSON.stringify(data));
    reset(data);
  };

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit(onFormSubmit),
    component: (
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <InputForm
            control={{
              label: 'Vodafone Cash Number',
              description: 'Local Egyptian wallet number for cash deposits.',
            }}
            controller={{ control, name: 'vodafoneCashNumber' }}
          />
          <InputForm
            control={{
              label: 'Instapay IPA Address / Username',
              description: 'Instapay Egyptian banking transfer address.',
            }}
            controller={{ control, name: 'instapayUsername' }}
          />
          <InputForm
            control={{
              label: 'PayPal Business Email',
              description: 'International payment address.',
            }}
            controller={{ control, name: 'paypalEmail' }}
          />
          <InputForm
            control={{
              label: 'Binance Pay ID / USDT Address',
              description: 'Cryptocurrency payment address.',
            }}
            controller={{ control, name: 'binanceId' }}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Payment Receipt Logs Channel',
              description: 'Channel where transaction transfer receipts are sent for admin review.',
            }}
            controller={{ control, name: 'receiptLogChannelId' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Auto-Confirm Verified Receipts',
              description: 'Automatically confirm order completion upon valid transfer verification.',
            }}
            controller={{ control, name: 'enableAutoConfirm' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Payment Gateway Configuration"
          description="Guild-specific store checkout gateways."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
