import { SimpleGrid, VStack } from '@chakra-ui/react';
import { ChannelSelectForm } from '@/components/forms/ChannelSelect';
import { SwitchFieldForm } from '@/components/forms/SwitchField';
import { useForm } from 'react-hook-form';
import { UseFormRender, UseFormRenderResult } from '@/config/types';
import { PaymentFeature } from '@/config/types/custom-types';
import { ConfigExportCard } from '@/components/feature/ConfigExportCard';
import { useRouter } from 'next/router';

export const usePaymentFeature: UseFormRender<PaymentFeature> = (
  initial,
  onSubmit
): UseFormRenderResult => {
  const guild = useRouter().query.guild as string;
  const { control, handleSubmit, reset, formState, watch } = useForm<PaymentFeature>({
    defaultValues: {
      paymentChannelId: initial?.paymentChannelId ?? '',
      acceptVodafoneCash: initial?.acceptVodafoneCash ?? true,
      acceptInstapay: initial?.acceptInstapay ?? true,
      acceptBinance: initial?.acceptBinance ?? true,
      acceptPaypal: initial?.acceptPaypal ?? true,
      acceptUsdt: initial?.acceptUsdt ?? true,
      autoPin: initial?.autoPin ?? true,
    },
  });

  const values = watch();

  const exportText = `// MG3 Payment Methods Configuration for Guild: ${guild || 'GUILD_ID'}
module.exports = {
  PAYMENT_CHANNEL_ID: '${values.paymentChannelId || ''}',
  ACCEPTED_METHODS: {
    VODAFONE_CASH: ${values.acceptVodafoneCash ? 'true' : 'false'},
    INSTAPAY: ${values.acceptInstapay ? 'true' : 'false'},
    BINANCE: ${values.acceptBinance ? 'true' : 'false'},
    PAYPAL: ${values.acceptPaypal ? 'true' : 'false'},
    USDT: ${values.acceptUsdt ? 'true' : 'false'}
  },
  AUTO_PIN_PANEL: ${values.autoPin ? 'true' : 'false'}
};`;

  return {
    canSave: formState.isDirty,
    reset: () => reset(),
    onSubmit: handleSubmit((values) => onSubmit(JSON.stringify(values))),
    component: (
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ChannelSelectForm
            control={{
              label: 'Payment Channel',
              description: 'Target channel where the /payment panel embed is sent.',
            }}
            controller={{ control, name: 'paymentChannelId' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Auto-Pin Panel',
              description: 'Automatically pin the payment methods embed in the channel.',
            }}
            controller={{ control, name: 'autoPin' }}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <SwitchFieldForm
            control={{
              label: 'Vodafone Cash',
              description: 'Show Vodafone Cash in payment panel.',
            }}
            controller={{ control, name: 'acceptVodafoneCash' }}
          />
          <SwitchFieldForm
            control={{
              label: 'InstaPay',
              description: 'Show InstaPay in payment panel.',
            }}
            controller={{ control, name: 'acceptInstapay' }}
          />
          <SwitchFieldForm
            control={{
              label: 'Binance Pay',
              description: 'Show Binance in payment panel.',
            }}
            controller={{ control, name: 'acceptBinance' }}
          />
          <SwitchFieldForm
            control={{
              label: 'PayPal',
              description: 'Show PayPal in payment panel.',
            }}
            controller={{ control, name: 'acceptPaypal' }}
          />
          <SwitchFieldForm
            control={{
              label: 'USDT (Crypto)',
              description: 'Show USDT in payment panel.',
            }}
            controller={{ control, name: 'acceptUsdt' }}
          />
        </SimpleGrid>

        <ConfigExportCard
          title="Export Payment Configuration"
          description="Guild-specific payment channel and methods settings."
          configText={exportText}
        />
      </VStack>
    ),
  };
};
