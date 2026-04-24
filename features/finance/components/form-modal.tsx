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
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
        <View style={s.sheet}>
          <View style={s.handle} />

          {formType === null ? (
            <TypeChoice onChoose={setFormType} />
          ) : (
            <>
              <View style={s.formHdr}>
                <TouchableOpacity onPress={() => setFormType(null)} style={s.backBtn}>
                  <IconSymbol name="chevron.left" size={20} color={Colors.t2} />
                </TouchableOpacity>
                <Text style={s.formTitle}>
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

function TypeChoice({ onChoose }: { onChoose: (t: FormType) => void }) {
  return (
    <View style={s.choice}>
      <Text style={s.choiceTitle}>O que deseja registrar?</Text>
      <TouchableOpacity
        style={[s.choiceCard, { borderColor: 'rgba(78,203,163,0.30)' }]}
        onPress={() => onChoose('income')}
      >
        <View style={[s.choiceIco, { backgroundColor: Colors.incomeSurf }]}>
          <IconSymbol name="briefcase.fill" size={26} color={Colors.income} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.choiceCardTitle, { color: Colors.income }]}>Receita</Text>
          <Text style={s.choiceCardSub}>Salário, freelance, bônus...</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.choiceCard, { borderColor: 'rgba(240,123,107,0.30)' }]}
        onPress={() => onChoose('expense')}
      >
        <View style={[s.choiceIco, { backgroundColor: Colors.expenseSurf }]}>
          <IconSymbol name="doc.text.fill" size={26} color={Colors.expense} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.choiceCardTitle, { color: Colors.expense }]}>Despesa</Text>
          <Text style={s.choiceCardSub}>Alimentação, contas, compras...</Text>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
      </TouchableOpacity>
    </View>
  );
}

function IncomeFormView({ form, onChange, onSave, isSaving }: any) {
  const set = (p: any) => onChange((f: any) => ({ ...f, ...p }));
  return (
    <>
      <Label t="Valor (R$)" />
      <Input placeholder="0,00" keyboardType="numeric"
        value={form.amount}
        onChangeText={(t: string) => set({ amount: maskAmount(t) })}
      />
      <Label t="Categoria" />
      <Chips options={INCOME_CATEGORIES} value={form.category} onSelect={(v: string) => set({ category: v })} color={Colors.income} />
      <Label t="Forma de recebimento" />
      <Chips options={INCOME_TYPES} value={form.type} onSelect={(v: string) => set({ type: v })} color={Colors.income} />
      <Label t="Data" />
      <Input placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.date} maxLength={10}
        onChangeText={(t: string) => set({ date: maskDate(t) })}
      />
      <SaveButton onPress={onSave} isSaving={isSaving} color={Colors.income} />
    </>
  );
}

function ExpenseFormView({ form, onChange, onSave, isSaving }: any) {
  const set = (p: any) => onChange((f: any) => ({ ...f, ...p }));
  return (
    <>
      <Label t="Valor (R$)" />
      <Input placeholder="0,00" keyboardType="numeric"
        value={form.amount}
        onChangeText={(t: string) => set({ amount: maskAmount(t) })}
      />
      <Label t="Categoria" />
      <Chips options={EXPENSE_CATEGORIES} value={form.category} onSelect={(v: string) => set({ category: v })} color={Colors.brand} />
      <Label t="Forma de pagamento" />
      <Chips options={EXPENSE_TYPES} value={form.type} onSelect={(v: string) => set({ type: v })} color={Colors.brand} />
      <Label t="Parcelas" />
      <View style={s.installRow}>
        <TouchableOpacity style={s.installBtn} onPress={() => set({ installments: Math.max(1, form.installments - 1) })}>
          <Text style={s.installBtnTxt}>−</Text>
        </TouchableOpacity>
        <Text style={s.installNum}>{form.installments}x</Text>
        <TouchableOpacity style={s.installBtn} onPress={() => set({ installments: form.installments + 1 })}>
          <Text style={s.installBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
      <Label t="Data da compra" />
      <Input placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.purchase_date} maxLength={10}
        onChangeText={(t: string) => set({ purchase_date: maskDate(t) })}
      />
      <Label t="Data do pagamento (1ª parcela)" />
      <Input placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.payment_date} maxLength={10}
        onChangeText={(t: string) => set({ payment_date: maskDate(t) })}
      />
      <SaveButton onPress={onSave} isSaving={isSaving} color={Colors.expense} />
    </>
  );
}

function Label({ t }: { t: string }) {
  return <Text style={s.lbl}>{t}</Text>;
}
function Input(props: any) {
  return (
    <TextInput
      style={s.input}
      placeholderTextColor={Colors.t3}
      {...props}
    />
  );
}
function Chips({ options, value, onSelect, color }: any) {
  return (
    <View style={s.chips}>
      {options.map((op: string) => {
        const active = value === op;
        return (
          <TouchableOpacity
            key={op}
            style={[s.chip, active && { backgroundColor: color + '22', borderColor: color }]}
            onPress={() => onSelect(op)}
          >
            <Text style={[s.chipTxt, active && { color, fontFamily: Fonts.bodySb }]}>{op}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
function SaveButton({ onPress, isSaving, color }: any) {
  return (
    <TouchableOpacity
      style={[s.saveBtn, { backgroundColor: color }, isSaving && { opacity: 0.55 }]}
      onPress={onPress}
      disabled={isSaving}
      activeOpacity={0.85}
    >
      <Text style={s.saveTxt}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
    maxHeight: '92%',
    borderTopWidth: 1, borderTopColor: Colors.bdr,
  },
  handle: { width: 36, height: 4, backgroundColor: Colors.bdr2, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },

  choice: { gap: 12, paddingBottom: 8 },
  choiceTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.t1, letterSpacing: -0.6, marginBottom: 6 },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: Radius.md, padding: 16,
    backgroundColor: Colors.bgSurf,
  },
  choiceIco: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  choiceCardTitle: { fontFamily: Fonts.heading, fontSize: 16 },
  choiceCardSub: { fontFamily: Fonts.body, fontSize: 12, color: Colors.t3, marginTop: 2 },

  formHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backBtn: { padding: 6, marginLeft: -4 },
  formTitle: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.t1 },

  lbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7, marginTop: 16 },
  input: {
    backgroundColor: Colors.bgSurf,
    borderWidth: 1.5, borderColor: Colors.bdr,
    borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: Fonts.body, fontSize: 15, color: Colors.t1, marginBottom: 0,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    borderWidth: 1.5, borderColor: Colors.bdr,
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.bgSurf,
  },
  chipTxt: { fontFamily: Fonts.bodyMd, fontSize: 13, color: Colors.t2 },

  installRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 4 },
  installBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgSurf, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.bdr,
  },
  installBtnTxt: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.t1, lineHeight: 26 },
  installNum: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.t1, minWidth: 36, textAlign: 'center' },

  saveBtn: { borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 20, marginBottom: 8 },
  saveTxt: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
