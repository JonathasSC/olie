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
import { FINANCE_COLORS, INCOME_CATEGORIES, INCOME_TYPES, EXPENSE_CATEGORIES, EXPENSE_TYPES } from '../constants';
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
    if (!incomeForm.amount) return Alert.alert('Attention', 'Enter the amount received.');
    if (!incomeForm.category) return Alert.alert('Attention', 'Select a category.');
    if (!incomeForm.type) return Alert.alert('Attention', 'Select a type.');
    if (incomeForm.date.length < 10) return Alert.alert('Attention', 'Enter the date in DD/MM/YYYY format.');

    const success = await onSaveIncome({
      amount: parseAmount(incomeForm.amount),
      category: incomeForm.category,
      payment_type: incomeForm.type,
      date: incomeForm.date
    });

    if (success) cleanAndExit();
  }

  async function handleSaveExpense() {
    if (!expenseForm.amount) return Alert.alert('Attention', 'Enter the purchase amount.');
    if (!expenseForm.category) return Alert.alert('Attention', 'Select a category.');
    if (!expenseForm.type) return Alert.alert('Attention', 'Select a payment type.');
    if (expenseForm.purchase_date.length < 10) return Alert.alert('Attention', 'Enter the purchase date.');
    if (expenseForm.payment_date.length < 10) return Alert.alert('Attention', 'Enter the payment date.');

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
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
        <View style={s.sheet}>
          <View style={s.handle} />

          {formType === null ? (
            <TypeChoice onChoose={setFormType} />
          ) : (
            <>
              <View style={s.formHeader}>
                <TouchableOpacity onPress={() => setFormType(null)} style={s.formBack}>
                  <IconSymbol name="chevron.left" size={20} color={FINANCE_COLORS.textSecondary} />
                </TouchableOpacity>
                <Text style={s.formTitle}>
                  {formType === 'income' ? '+ Register Income' : '− Register Expense'}
                </Text>
                <TouchableOpacity onPress={cleanAndExit}>
                  <IconSymbol name="xmark" size={20} color={FINANCE_COLORS.textSecondary} />
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

function TypeChoice({ onChoose }: { onChoose: (t: FormType) => void }) {
  return (
    <View style={s.choice}>
      <Text style={s.choiceTitle}>What do you want to register?</Text>
      <TouchableOpacity style={[s.choiceCard, { borderColor: FINANCE_COLORS.income }]} onPress={() => onChoose('income')}>
        <View style={[s.choiceIcon, { backgroundColor: FINANCE_COLORS.incomeSurface }]}>
          <IconSymbol name="briefcase.fill" size={26} color={FINANCE_COLORS.income} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.choiceCardTitle, { color: FINANCE_COLORS.income }]}>Register Income</Text>
          <Text style={s.choiceCardSub}>Salary, freelance, bonus...</Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={FINANCE_COLORS.income} />
      </TouchableOpacity>
      <TouchableOpacity style={[s.choiceCard, { borderColor: FINANCE_COLORS.expense }]} onPress={() => onChoose('expense')}>
        <View style={[s.choiceIcon, { backgroundColor: FINANCE_COLORS.expenseSurface }]}>
          <IconSymbol name="doc.text.fill" size={26} color={FINANCE_COLORS.expense} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.choiceCardTitle, { color: FINANCE_COLORS.expense }]}>Register Expense</Text>
          <Text style={s.choiceCardSub}>Food, bills, leisure...</Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={FINANCE_COLORS.expense} />
      </TouchableOpacity>
    </View>
  );
}

function IncomeFormView({ form, onChange, onSave, isSaving }: any) {
  const set = (p: any) => onChange((f: any) => ({ ...f, ...p }));
  return (
    <>
      <Label t="Amount *" />
      <Input placeholder="$ 0.00" keyboardType="numeric"
        value={form.amount ? `$ ${form.amount}` : ''}
        onChangeText={(t: string) => set({ amount: maskAmount(t.replace('$ ', '')) })}
      />
      <Label t="Category" />
      <Chips options={INCOME_CATEGORIES} value={form.category} onSelect={(v: string) => set({ category: v })} color={FINANCE_COLORS.income} />
      <Label t="Type" />
      <Chips options={INCOME_TYPES} value={form.type} onSelect={(v: string) => set({ type: v })} color={FINANCE_COLORS.income} />
      <Label t="Date" />
      <Input placeholder="DD/MM/YYYY" keyboardType="numeric" value={form.date} maxLength={10}
        onChangeText={(t: string) => set({ date: maskDate(t) })}
      />
      <SaveButton onPress={onSave} isSaving={isSaving} color={FINANCE_COLORS.income} />
    </>
  );
}

function ExpenseFormView({ form, onChange, onSave, isSaving }: any) {
  const set = (p: any) => onChange((f: any) => ({ ...f, ...p }));
  return (
    <>
      <Label t="Purchase Amount *" />
      <Input placeholder="$ 0.00" keyboardType="numeric"
        value={form.amount ? `$ ${form.amount}` : ''}
        onChangeText={(t: string) => set({ amount: maskAmount(t.replace('$ ', '')) })}
      />
      <Label t="Category" />
      <Chips options={EXPENSE_CATEGORIES} value={form.category} onSelect={(v: string) => set({ category: v })} color={FINANCE_COLORS.accent} />
      <Label t="Payment Type" />
      <Chips options={EXPENSE_TYPES} value={form.type} onSelect={(v: string) => set({ type: v })} color={FINANCE_COLORS.accent} />
      <Label t="Installments" />
      <View style={s.installmentsRow}>
        <TouchableOpacity style={s.installmentsBtn} onPress={() => set({ installments: Math.max(1, form.installments - 1) })}>
          <Text style={s.installmentsBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.installmentsNum}>{form.installments}x</Text>
        <TouchableOpacity style={s.installmentsBtn} onPress={() => set({ installments: form.installments + 1 })}>
          <Text style={s.installmentsBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <Label t="Purchase Date" />
      <Input placeholder="DD/MM/YYYY" keyboardType="numeric" value={form.purchase_date} maxLength={10}
        onChangeText={(t: string) => set({ purchase_date: maskDate(t) })}
      />
      <Label t="Payment Date (1st installment)" />
      <Input placeholder="DD/MM/YYYY" keyboardType="numeric" value={form.payment_date} maxLength={10}
        onChangeText={(t: string) => set({ payment_date: maskDate(t) })}
      />
      <SaveButton onPress={onSave} isSaving={isSaving} color={FINANCE_COLORS.expense} />
    </>
  );
}

function Label({ t }: { t: string }) { return <Text style={s.label}>{t}</Text>; }
function Input(props: any) { return <TextInput style={s.input} placeholderTextColor={FINANCE_COLORS.textMuted} {...props} />; }
function Chips({ options, value, onSelect, color }: any) {
  return (
    <View style={s.chips}>
      {options.map((op: string) => (
        <TouchableOpacity key={op} style={[s.chip, value === op && { backgroundColor: color, borderColor: color }]} onPress={() => onSelect(op)}>
          <Text style={[s.chipText, value === op && s.chipTextActive]}>{op}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
function SaveButton({ onPress, isSaving, color }: any) {
  return (
    <TouchableOpacity style={[s.button, { backgroundColor: color }, isSaving && s.buttonOff]} onPress={onPress} disabled={isSaving}>
      <Text style={s.buttonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: FINANCE_COLORS.overlay },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: FINANCE_COLORS.surfaceHigh, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12, maxHeight: '92%',
  },
  handle: { width: 36, height: 4, backgroundColor: FINANCE_COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },
  choice: { gap: 12, paddingBottom: 8 },
  choiceTitle: { fontSize: 19, fontWeight: '700', color: FINANCE_COLORS.textPrimary, marginBottom: 6 },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 16, padding: 16,
    backgroundColor: FINANCE_COLORS.surface,
  },
  choiceIcon: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  choiceCardTitle: { fontSize: 16, fontWeight: '700' },
  choiceCardSub: { fontSize: 12, color: FINANCE_COLORS.textMuted, marginTop: 2 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  formBack: { padding: 6, marginLeft: -4 },
  formTitle: { fontSize: 16, fontWeight: '700', color: FINANCE_COLORS.textPrimary },
  label: { fontSize: 12, fontWeight: '700', color: FINANCE_COLORS.textMuted, marginBottom: 8, marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1.5, borderColor: FINANCE_COLORS.border, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: FINANCE_COLORS.surface },
  chipText: { fontSize: 13, color: FINANCE_COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1.5, borderColor: FINANCE_COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: FINANCE_COLORS.textPrimary, marginBottom: 16, backgroundColor: FINANCE_COLORS.surfaceInput,
  },
  installmentsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  installmentsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: FINANCE_COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: FINANCE_COLORS.border,
  },
  installmentsBtnText: { fontSize: 22, color: FINANCE_COLORS.textPrimary, lineHeight: 26 },
  installmentsNum: { fontSize: 18, fontWeight: '700', color: FINANCE_COLORS.textPrimary, minWidth: 36, textAlign: 'center' },
  button: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 10, marginBottom: 8 },
  buttonOff: { opacity: 0.55 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
