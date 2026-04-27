import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Shadow } from '@/constants/design';
import {
  FINANCE_COLORS,
  INCOME_CATEGORIES,
  INCOME_TYPES,
  EXPENSE_CATEGORIES,
  EXPENSE_TYPES,
} from '../constants';
import { getTodayDate, maskDate, maskAmount, parseAmount } from '../utils/formatters';

type FormType = 'income' | 'expense' | null;

interface FormModalProps {
  isVisible: boolean;
  onClose: () => void;
  isSaving: boolean;
  onSaveIncome: (data: any) => Promise<boolean>;
  onSaveExpense: (data: any) => Promise<boolean>;
}

export function FormModal({ isVisible, onClose, isSaving, onSaveIncome, onSaveExpense }: FormModalProps) {
  const [formType, setFormType] = useState<FormType>(null);
  const today = getTodayDate();

  const [incomeForm, setIncomeForm] = useState({ amount: '', category: '', type: '', date: today });
  const [expenseForm, setExpenseForm] = useState({
    amount: '', category: '', type: '', installments: 1, purchase_date: today, payment_date: today,
  });

  function cleanAndExit() {
    setFormType(null);
    setIncomeForm({ amount: '', category: '', type: '', date: today });
    setExpenseForm({ amount: '', category: '', type: '', installments: 1, purchase_date: today, payment_date: today });
    onClose();
  }

  async function handleSaveIncome() {
    if (!incomeForm.amount) return Alert.alert('Atenção', 'Informe o valor recebido.');
    if (!incomeForm.category) return Alert.alert('Atenção', 'Selecione uma categoria.');
    if (!incomeForm.type) return Alert.alert('Atenção', 'Selecione um tipo.');
    const success = await onSaveIncome({
      amount: parseAmount(incomeForm.amount),
      category: incomeForm.category,
      payment_type: incomeForm.type,
      date: incomeForm.date,
    });
    if (success) cleanAndExit();
  }

  async function handleSaveExpense() {
    if (!expenseForm.amount) return Alert.alert('Atenção', 'Informe o valor da compra.');
    if (!expenseForm.category) return Alert.alert('Atenção', 'Selecione uma categoria.');
    if (!expenseForm.type) return Alert.alert('Atenção', 'Selecione a forma de pagamento.');
    const success = await onSaveExpense({
      amount: parseAmount(expenseForm.amount),
      category: expenseForm.category,
      payment_type: expenseForm.type,
      installments: expenseForm.installments,
      purchase_date: expenseForm.purchase_date,
      payment_date: expenseForm.payment_date,
    });
    if (success) cleanAndExit();
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={cleanAndExit}>
      <TouchableWithoutFeedback onPress={cleanAndExit}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {formType === null ? (
            <TypeChoice onChoose={setFormType} />
          ) : (
            <>
              <View style={styles.formHeader}>
                <TouchableOpacity onPress={() => setFormType(null)} style={styles.backButton}>
                  <IconSymbol name="chevron.left" size={20} color={Colors.t2} />
                </TouchableOpacity>
                <Text style={styles.formTitle}>
                  {formType === 'income' ? 'Registrar Receita' : 'Registrar Despesa'}
                </Text>
                <TouchableOpacity onPress={cleanAndExit}>
                  <IconSymbol name="xmark" size={20} color={Colors.t3} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {formType === 'income' ? (
                  <IncomeFormView form={incomeForm} onChange={setIncomeForm} onSave={handleSaveIncome} isSaving={isSaving} />
                ) : (
                  <ExpenseFormView form={expenseForm} onChange={setExpenseForm} onSave={handleSaveExpense} isSaving={isSaving} />
                )}
              </ScrollView>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TypeChoice({ onChoose }: { onChoose: (type: FormType) => void }) {
  return (
    <View style={styles.typeChoiceContainer}>
      <Text style={styles.typeChoiceTitle}>O que deseja registrar?</Text>
      <TouchableOpacity
        style={[styles.typeOptionCard, { borderColor: 'rgba(78,203,163,0.30)' }]}
        onPress={() => onChoose('income')}
      >
        <View style={[styles.typeOptionIcon, { backgroundColor: Colors.incomeSurf }]}>
          <IconSymbol name="briefcase.fill" size={26} color={Colors.income} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.typeOptionTitle, { color: Colors.income }]}>Receita</Text>
          <Text style={styles.typeOptionSubtitle}>Salário, freelance, bônus...</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeOptionCard, { borderColor: 'rgba(240,123,107,0.30)' }]}
        onPress={() => onChoose('expense')}
      >
        <View style={[styles.typeOptionIcon, { backgroundColor: Colors.expenseSurf }]}>
          <IconSymbol name="doc.text.fill" size={26} color={Colors.expense} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.typeOptionTitle, { color: Colors.expense }]}>Despesa</Text>
          <Text style={styles.typeOptionSubtitle}>Alimentação, contas, compras...</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
      </TouchableOpacity>
    </View>
  );
}

function IncomeFormView({ form, onChange, onSave, isSaving }: any) {
  const updateField = (partialUpdate: any) => onChange((currentForm: any) => ({ ...currentForm, ...partialUpdate }));
  return (
    <>
      <FieldLabel text="Valor (R$)" />
      <FieldInput placeholder="0,00" keyboardType="numeric"
        value={form.amount}
        onChangeText={(text: string) => updateField({ amount: maskAmount(text) })}
      />
      <FieldLabel text="Categoria" />
      <ChipSelector options={INCOME_CATEGORIES} value={form.category} onSelect={(value: string) => updateField({ category: value })} color={Colors.income} />
      <FieldLabel text="Forma de recebimento" />
      <ChipSelector options={INCOME_TYPES} value={form.type} onSelect={(value: string) => updateField({ type: value })} color={Colors.income} />
      <FieldLabel text="Data" />
      <FieldInput placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.date} maxLength={10}
        onChangeText={(text: string) => updateField({ date: maskDate(text) })}
      />
      <SaveButton onPress={onSave} isSaving={isSaving} color={Colors.income} />
    </>
  );
}

function ExpenseFormView({ form, onChange, onSave, isSaving }: any) {
  const updateField = (partialUpdate: any) => onChange((currentForm: any) => ({ ...currentForm, ...partialUpdate }));
  return (
    <>
      <FieldLabel text="Valor (R$)" />
      <FieldInput placeholder="0,00" keyboardType="numeric"
        value={form.amount}
        onChangeText={(text: string) => updateField({ amount: maskAmount(text) })}
      />
      <FieldLabel text="Categoria" />
      <ChipSelector options={EXPENSE_CATEGORIES} value={form.category} onSelect={(value: string) => updateField({ category: value })} color={Colors.brand} />
      <FieldLabel text="Forma de pagamento" />
      <ChipSelector options={EXPENSE_TYPES} value={form.type} onSelect={(value: string) => updateField({ type: value })} color={Colors.brand} />
      <FieldLabel text="Parcelas" />
      <View style={styles.installmentsRow}>
        <TouchableOpacity style={styles.installmentsButton} onPress={() => updateField({ installments: Math.max(1, form.installments - 1) })}>
          <Text style={styles.installmentsButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.installmentsCount}>{form.installments}x</Text>
        <TouchableOpacity style={styles.installmentsButton} onPress={() => updateField({ installments: form.installments + 1 })}>
          <Text style={styles.installmentsButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FieldLabel text="Data da compra" />
      <FieldInput placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.purchase_date} maxLength={10}
        onChangeText={(text: string) => updateField({ purchase_date: maskDate(text) })}
      />
      <FieldLabel text="Data do pagamento (1ª parcela)" />
      <FieldInput placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.payment_date} maxLength={10}
        onChangeText={(text: string) => updateField({ payment_date: maskDate(text) })}
      />
      <SaveButton onPress={onSave} isSaving={isSaving} color={Colors.expense} />
    </>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

function FieldInput(props: any) {
  return (
    <TextInput
      style={styles.fieldInput}
      placeholderTextColor={Colors.t3}
      {...props}
    />
  );
}

function ChipSelector({ options, value, onSelect, color }: any) {
  return (
    <View style={styles.chipsRow}>
      {options.map((option: string) => {
        const isActive = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isActive && { backgroundColor: color + '22', borderColor: color }]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.chipText, isActive && { color, fontFamily: Fonts.bodySb }]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SaveButton({ onPress, isSaving, color }: any) {
  return (
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: color }, isSaving && { opacity: 0.55 }]}
      onPress={onPress}
      disabled={isSaving}
      activeOpacity={0.85}
    >
      <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheetContainer: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
    maxHeight: '92%',
    borderTopWidth: 1, borderTopColor: Colors.bdr,
  },
  dragHandle: { width: 36, height: 4, backgroundColor: Colors.bdr2, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },

  typeChoiceContainer: { gap: 12, paddingBottom: 8 },
  typeChoiceTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.t1, letterSpacing: -0.6, marginBottom: 6 },
  typeOptionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: Radius.md, padding: 16,
    backgroundColor: Colors.bgSurf,
  },
  typeOptionIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typeOptionTitle: { fontFamily: Fonts.heading, fontSize: 16 },
  typeOptionSubtitle: { fontFamily: Fonts.body, fontSize: 12, color: Colors.t3, marginTop: 2 },

  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { padding: 6, marginLeft: -4 },
  formTitle: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.t1 },

  fieldLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7, marginTop: 16 },
  fieldInput: {
    backgroundColor: Colors.bgSurf,
    borderWidth: 1.5, borderColor: Colors.bdr,
    borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: Fonts.body, fontSize: 15, color: Colors.t1, marginBottom: 0,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1.5, borderColor: Colors.bdr,
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.bgSurf,
  },
  chipText: { fontFamily: Fonts.bodyMd, fontSize: 13, color: Colors.t2 },

  installmentsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 4 },
  installmentsButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgSurf, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.bdr,
  },
  installmentsButtonText: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.t1, lineHeight: 26 },
  installmentsCount: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.t1, minWidth: 36, textAlign: 'center' },

  saveButton: { borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 20, marginBottom: 8 },
  saveButtonText: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
