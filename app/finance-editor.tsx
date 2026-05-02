import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ScreenHeader from '../components/screen-header';
import { CategorySelector } from '../features/finance/components/category-selector';
import { SegmentSelector } from '../features/finance/components/segment-selector';
import { FormType, INSTALLMENT_OPTIONS } from '../features/finance/constants/finance-form-config';
import { useFinanceForm } from '../features/finance/hooks/use-finance-form';
import { FinanceRepository } from '../features/finance/services/finance-repository';
import { ListItem } from '../features/finance/types';

export default function FinanceEditorScreen() {
  const { type, id } = useLocalSearchParams<{ type?: string; id?: string }>();
  const formType = (type as FormType) ?? 'expense';
  const itemId = id ? parseInt(id, 10) : undefined;

  const item = useMemo<ListItem | undefined>(() => {
    if (!itemId) return undefined;
    if (formType === 'expense') {
      const found = FinanceRepository.findExpense(itemId);
      return found ? { ...found, type: 'expense' } : undefined;
    }
    const found = FinanceRepository.findIncome(itemId);
    return found ? { ...found, type: 'income' } : undefined;
  }, []);

  const { fields, handlers, setters, save, destroy, isEdit, config, saving } = useFinanceForm(formType, item);
  const { amount, category, paymentType, installments, purchaseDate, paymentDate, date } = fields;
  const { handleAmount, handlePurchaseDate, handlePaymentDate, handleDate } = handlers;
  const { setCategory, setPaymentType, setInstallments } = setters;
  const { accent } = config;

  const paymentOptions = config.paymentTypes.map((p) => ({ value: p, label: p }));

  const rightAction = isEdit ? (
    <TouchableOpacity onPress={destroy} activeOpacity={0.7} style={styles.deleteButton}>
      <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
    </TouchableOpacity>
  ) : undefined;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title={isEdit ? 'Editar' : config.title} rightAction={rightAction} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={amount}
            onChangeText={handleAmount}
            autoFocus
          />

          <Text style={styles.label}>Categoria</Text>
          <CategorySelector
            items={config.categories}
            value={category}
            accent={accent}
            onChange={setCategory}
          />

          <Text style={styles.label}>{config.paymentLabel}</Text>
          <SegmentSelector
            options={paymentOptions}
            value={paymentType}
            accent={accent}
            onChange={setPaymentType}
          />

          {config.hasInstallments && (
            <>
              <Text style={styles.label}>Parcelas</Text>
              <SegmentSelector
                options={INSTALLMENT_OPTIONS}
                value={installments}
                accent={accent}
                onChange={setInstallments}
              />
            </>
          )}

          {config.hasExpenseDates && (
            <>
              <Text style={styles.label}>Data da compra</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={purchaseDate}
                onChangeText={handlePurchaseDate}
                maxLength={10}
              />

              <Text style={styles.label}>Data de pagamento</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={paymentDate}
                onChangeText={handlePaymentDate}
                maxLength={10}
              />
            </>
          )}

          {!config.hasExpenseDates && (
            <>
              <Text style={styles.label}>Data</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={date}
                onChangeText={handleDate}
                maxLength={10}
              />
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={save}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 11,
    color: '#8a8a8a',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#000',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#555',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
