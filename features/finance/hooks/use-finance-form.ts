import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { FINANCE_FORM_CONFIG, FormType } from '../constants/finance-form-config';
import { FinanceRepository } from '../services/finance-repository';
import { ListItem } from '../types';
import { StreakRepository } from '@/services/streak';
import { getTodayDate, maskAmount, maskDate, parseAmount } from '../utils/formatters';

export function useFinanceForm(formType: FormType, item?: ListItem) {
  const isEdit = !!item;
  const config = FINANCE_FORM_CONFIG[formType];
  const today = getTodayDate();

  const [amount, setAmount] = useState(
    item ? item.amount.toFixed(2) : ''
  );
  const [category, setCategory]         = useState(item?.category ?? '');
  const [paymentType, setPaymentType]   = useState(item?.payment_type ?? '');
  const [installments, setInstallments] = useState(
    item?.type === 'expense' ? String(item.installments) : '1'
  );
  const [purchaseDate, setPurchaseDate] = useState(
    item?.type === 'expense' ? item.purchase_date : today
  );
  const [paymentDate, setPaymentDate] = useState(
    item?.type === 'expense' ? item.payment_date : today
  );
  const [date, setDate] = useState(
    item?.type === 'income' ? item.date : today
  );

  function handleAmount(v: string)       { setAmount(maskAmount(v)); }
  function handlePurchaseDate(v: string) { setPurchaseDate(maskDate(v)); }
  function handlePaymentDate(v: string)  { setPaymentDate(maskDate(v)); }
  function handleDate(v: string)         { setDate(maskDate(v)); }

  const [saving, setSaving] = useState(false);

  function save() {
    if (saving) return;
    const parsedAmount = parseAmount(amount);
    if (!parsedAmount) return Alert.alert('Atenção', 'Informe o valor.');
    if (!category)     return Alert.alert('Atenção', 'Selecione uma categoria.');

    setSaving(true);
    const resolvedPayment = paymentType || config.paymentTypes[0];

    if (formType === 'expense') {
      const data = {
        amount: parsedAmount,
        category,
        payment_type: resolvedPayment,
        installments: parseInt(installments, 10) || 1,
        purchase_date: purchaseDate,
        payment_date: paymentDate,
      };
      if (isEdit && item!.id) {
        FinanceRepository.updateExpense(item!.id, data);
      } else {
        FinanceRepository.addExpense(data);
        StreakRepository.recordUsage();
      }
    } else {
      const data = {
        amount: parsedAmount,
        category,
        payment_type: resolvedPayment,
        date,
      };
      if (isEdit && item!.id) {
        FinanceRepository.updateIncome(item!.id, data);
      } else {
        FinanceRepository.addIncome(data);
        StreakRepository.recordUsage();
      }
    }

    router.back();
  }

  function destroy() {
    Alert.alert('Excluir registro', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          if (!item?.id) return;
          formType === 'expense'
            ? FinanceRepository.deleteExpense(item.id)
            : FinanceRepository.deleteIncome(item.id);
          router.back();
        },
      },
    ]);
  }

  return {
    fields: { amount, category, paymentType, installments, purchaseDate, paymentDate, date },
    handlers: { handleAmount, handlePurchaseDate, handlePaymentDate, handleDate },
    setters: { setCategory, setPaymentType, setInstallments },
    save,
    destroy,
    isEdit,
    config,
    saving,
  };
}
