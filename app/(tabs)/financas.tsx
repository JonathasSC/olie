import { useCallback, useMemo, useState } from 'react';
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
import { ThemedView } from '@/components/themed-view';
import { shadowMd } from '@/constants/design';
import {
  deletarGanho,
  deletarGasto,
  inserirGanho,
  inserirGasto,
  listarTudo,
  type Ganho,
  type Gasto,
  type ItemLista,
} from '@/lib/financas-db';

// ─── paleta nubank (70-20-10) ─────────────────────────────────────────────────
// 70 % — fundos escuros neutros
// 20 % — texto e bordas cinza/branco
// 10 % — roxo Nubank como destaque

const FIN = {
  // 70 % base
  bg:           '#0A0A0A',
  surface:      '#161616',
  surfaceHigh:  '#1E1E1E',
  surfaceInput: '#121212',

  // 20 % neutros
  border:        '#2C2C2C',
  borderLight:   '#222222',
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted:     '#525252',

  // 10 % acento
  accent:        '#820AD1',
  accentDark:    '#6A08AB',
  accentSurface: '#1D0A2E',

  // semânticos (visíveis em fundo escuro)
  income:        '#34D399',
  incomeSurface: 'rgba(52, 211, 153, 0.12)',
  expense:       '#F87171',
  expenseSurface:'rgba(248, 113, 113, 0.12)',

  warning:        '#FBBF24',
  warningSurface: 'rgba(251, 191, 36, 0.1)',

  overlay: 'rgba(0, 0, 0, 0.75)',
} as const;

// ─── constantes ──────────────────────────────────────────────────────────────

const CAT_GANHO = ['Salário', 'Freelance', 'Bônus', 'Presente'];
const TIPO_GANHO = ['Dinheiro físico', 'Digital (Pix)', 'Ticket'];
const CAT_GASTO = ['Alimentação', 'Transporte', 'Contas', 'Lazer'];
const TIPO_GASTO = ['Crédito', 'Saldo', 'Ticket'];

type CategoriaIcone = 'fork.knife' | 'car.fill' | 'doc.text.fill' | 'sparkles' | 'briefcase.fill' | 'laptopcomputer' | 'gift.fill' | 'dollarsign.circle.fill';

const ICONE_CAT: Record<string, CategoriaIcone> = {
  Alimentação: 'fork.knife',
  Transporte: 'car.fill',
  Contas: 'doc.text.fill',
  Lazer: 'sparkles',
  Salário: 'briefcase.fill',
  Freelance: 'laptopcomputer',
  Bônus: 'gift.fill',
  Presente: 'gift.fill',
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function dataHoje(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function parseDMY(str: string): Date | null {
  const p = str.split('/');
  if (p.length !== 3) return null;
  const d = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(d.getTime()) ? null : d;
}

function diaInicio(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDataItem(item: ItemLista): string {
  return item.natureza === 'ganho' ? (item as Ganho).data : (item as Gasto).data_compra;
}

function mascaraData(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function mascaraValor(v: string): string {
  const n = v.replace(/\D/g, '');
  if (!n) return '';
  return (parseInt(n, 10) / 100).toFixed(2).replace('.', ',');
}

function parseValor(v: string): number {
  return parseFloat(v.replace(',', '.')) || 0;
}

function fmtMoeda(v: number): string {
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

// ─── filtro e agrupamento ────────────────────────────────────────────────────

type Periodo = 'hoje' | 'semana' | 'mes';

function filtrarPorPeriodo(itens: ItemLista[], periodo: Periodo): ItemLista[] {
  const agora = new Date();
  const hoje = diaInicio(agora);

  return itens.filter((item) => {
    const d = parseDMY(getDataItem(item));
    if (!d) return false;
    const dia = diaInicio(d);

    if (periodo === 'hoje') return dia.getTime() === hoje.getTime();

    if (periodo === 'semana') {
      const inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - 6);
      return dia >= inicio;
    }

    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  });
}

type Grupo = { label: string; sortKey: string; itens: ItemLista[] };

function agruparPorData(itens: ItemLista[]): Grupo[] {
  const agora = new Date();
  const hoje = diaInicio(agora);
  const ontem = diaInicio(new Date(hoje.getTime() - 86400000));

  const mapa = new Map<string, Grupo>();

  for (const item of itens) {
    const d = parseDMY(getDataItem(item));
    if (!d) continue;
    const dia = diaInicio(d);
    const t = dia.getTime();

    let label: string;
    let sortKey: string;
    if (t === hoje.getTime()) { label = 'Hoje'; sortKey = 'z_hoje'; }
    else if (t === ontem.getTime()) { label = 'Ontem'; sortKey = 'z_ontem'; }
    else {
      const dd = String(dia.getDate()).padStart(2, '0');
      const mm = String(dia.getMonth() + 1).padStart(2, '0');
      label = `${dd}/${mm}/${dia.getFullYear()}`;
      sortKey = `${dia.getFullYear()}-${mm}-${dd}`;
    }

    if (!mapa.has(sortKey)) mapa.set(sortKey, { label, sortKey, itens: [] });
    mapa.get(sortKey)!.itens.push(item);
  }

  return [...mapa.values()].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

function gerarInsights(filtrados: ItemLista[], todos: ItemLista[]): string[] {
  const gastosFiltro = filtrados.filter((i) => i.natureza === 'gasto');
  const result: string[] = [];

  if (gastosFiltro.length > 0) {
    const byCat = new Map<string, number>();
    gastosFiltro.forEach((g) => byCat.set(g.categoria, (byCat.get(g.categoria) ?? 0) + g.valor));
    const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) result.push(`Maior gasto: ${top[0]}`);
  }

  const agora = new Date();
  const gastoHoje = todos
    .filter((i) => i.natureza === 'gasto')
    .filter((i) => {
      const d = parseDMY(getDataItem(i));
      return d && d.getDate() === agora.getDate() && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    })
    .reduce((s, i) => s + i.valor, 0);

  if (gastoHoje > 0) result.push(`Total gasto hoje: ${fmtMoeda(gastoHoje)}`);

  return result;
}

// ─── tipos do formulário ─────────────────────────────────────────────────────

type FormTipo = 'ganho' | 'gasto' | null;
type FormGanho = { valor: string; categoria: string; tipo: string; data: string };
type FormGasto = {
  valor: string; categoria: string; tipo: string;
  parcelas: number; data_compra: string; data_pagamento: string;
};

// ─── tela principal ──────────────────────────────────────────────────────────

export default function FinancasScreen() {
  const [todos, setTodos] = useState<ItemLista[]>(() => listarTudo());
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [modalAberto, setModalAberto] = useState(false);
  const [formTipo, setFormTipo] = useState<FormTipo>(null);
  const [salvando, setSalvando] = useState(false);

  const hoje = dataHoje();
  const [formGanho, setFormGanho] = useState<FormGanho>({ valor: '', categoria: '', tipo: '', data: hoje });
  const [formGasto, setFormGasto] = useState<FormGasto>({
    valor: '', categoria: '', tipo: '', parcelas: 1, data_compra: hoje, data_pagamento: hoje,
  });

  const recarregar = useCallback(() => setTodos(listarTudo()), []);

  const filtrados = useMemo(() => filtrarPorPeriodo(todos, periodo), [todos, periodo]);

  const resumo = useMemo(() => {
    const totalGanhos = filtrados.filter((i) => i.natureza === 'ganho').reduce((s, i) => s + i.valor, 0);
    const totalGastos = filtrados.filter((i) => i.natureza === 'gasto').reduce((s, i) => s + i.valor, 0);
    return { totalGanhos, totalGastos, saldo: totalGanhos - totalGastos };
  }, [filtrados]);

  const grupos = useMemo(() => agruparPorData(filtrados), [filtrados]);
  const insights = useMemo(() => gerarInsights(filtrados, todos), [filtrados, todos]);

  function abrirModal() {
    const d = dataHoje();
    setFormGanho({ valor: '', categoria: '', tipo: '', data: d });
    setFormGasto({ valor: '', categoria: '', tipo: '', parcelas: 1, data_compra: d, data_pagamento: d });
    setFormTipo(null);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setFormTipo(null);
  }

  function salvarGanho() {
    if (!formGanho.valor) return Alert.alert('Atenção', 'Informe o valor recebido.');
    if (!formGanho.categoria) return Alert.alert('Atenção', 'Selecione uma categoria.');
    if (!formGanho.tipo) return Alert.alert('Atenção', 'Selecione o tipo.');
    if (formGanho.data.length < 10) return Alert.alert('Atenção', 'Informe a data no formato DD/MM/AAAA.');

    setSalvando(true);
    try {
      inserirGanho({ valor: parseValor(formGanho.valor), categoria: formGanho.categoria, tipo: formGanho.tipo, data: formGanho.data });
      recarregar();
      fecharModal();
    } catch (e) {
      Alert.alert('Erro', String(e));
    } finally {
      setSalvando(false);
    }
  }

  function salvarGasto() {
    if (!formGasto.valor) return Alert.alert('Atenção', 'Informe o valor da compra.');
    if (!formGasto.categoria) return Alert.alert('Atenção', 'Selecione uma categoria.');
    if (!formGasto.tipo) return Alert.alert('Atenção', 'Selecione o tipo de pagamento.');
    if (formGasto.data_compra.length < 10) return Alert.alert('Atenção', 'Informe a data da compra.');
    if (formGasto.data_pagamento.length < 10) return Alert.alert('Atenção', 'Informe a data do pagamento.');

    setSalvando(true);
    try {
      inserirGasto({
        valor: parseValor(formGasto.valor), categoria: formGasto.categoria, tipo: formGasto.tipo,
        parcelas: formGasto.parcelas, data_compra: formGasto.data_compra, data_pagamento: formGasto.data_pagamento,
      });
      recarregar();
      fecharModal();
    } catch (e) {
      Alert.alert('Erro', String(e));
    } finally {
      setSalvando(false);
    }
  }

  function confirmarDeletar(item: ItemLista) {
    Alert.alert('Remover', 'Deseja remover este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: () => {
          if (!item.id) return;
          if (item.natureza === 'ganho') deletarGanho(item.id);
          else deletarGasto(item.id);
          recarregar();
        },
      },
    ]);
  }

  const saldoPositivo = resumo.saldo >= 0;

  return (
    <ThemedView style={s.tela} lightColor={FIN.bg} darkColor={FIN.bg}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* cabeçalho fixo */}
        <View style={s.cabecalhoWrap}>
          <Text style={s.tituloPagina}>Controle de Gastos</Text>
        </View>

        {/* card saldo */}
        <View style={s.cardSaldo}>
          <Text style={s.saldoRotulo}>Saldo do período</Text>
          <Text style={[s.saldoValor, { color: saldoPositivo ? '#E9D5FF' : '#FCA5A5' }]}>
            {fmtMoeda(resumo.saldo)}
          </Text>
          <View style={s.saldoDetalhes}>
            <View style={s.saldoDetalheItem}>
              <Text style={s.saldoDetalheRotulo}>↑ GANHOS</Text>
              <Text style={[s.saldoDetalheValor, { color: FIN.income }]}>{fmtMoeda(resumo.totalGanhos)}</Text>
            </View>
            <View style={s.saldoDetalheDiv} />
            <View style={s.saldoDetalheItem}>
              <Text style={s.saldoDetalheRotulo}>↓ GASTOS</Text>
              <Text style={[s.saldoDetalheValor, { color: FIN.expense }]}>{fmtMoeda(resumo.totalGastos)}</Text>
            </View>
          </View>
        </View>

        {/* filtro período */}
        <View style={s.filtroRow}>
          {(['hoje', 'semana', 'mes'] as Periodo[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[s.filtroBotao, periodo === p && s.filtroBotaoAtivo]}
              onPress={() => setPeriodo(p)}
            >
              <Text style={[s.filtroTexto, periodo === p && s.filtroTextoAtivo]}>
                {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* insights */}
        {insights.length > 0 && (
          <View style={s.insightsRow}>
            <IconSymbol name="lightbulb.fill" size={14} color={FIN.warning} />
            <Text style={s.insightsTexto}>{insights.join('  ·  ')}</Text>
          </View>
        )}

        {/* lista agrupada */}
        {grupos.length === 0 ? (
          <Text style={s.vazio}>Nenhum registro no período.</Text>
        ) : (
          grupos.map((grupo) => (
            <View key={grupo.sortKey}>
              <View style={s.grupoHeader}>
                <Text style={s.grupoLabel}>{grupo.label}</Text>
                <View style={s.grupoLinha} />
              </View>
              {grupo.itens.map((item, i) => (
                <ItemCard
                  key={`${item.natureza}-${item.id ?? i}`}
                  item={item}
                  onLongPress={() => confirmarDeletar(item)}
                />
              ))}
            </View>
          ))
        )}

        {/* espaço para o botão fixo */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* botão registrar */}
      <View style={s.btnWrap}>
        <TouchableOpacity style={s.btnRegistrar} onPress={abrirModal} activeOpacity={0.85}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.btnRegistrarTexto}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {/* modal */}
      <Modal visible={modalAberto} animationType="slide" transparent onRequestClose={fecharModal}>
        <TouchableWithoutFeedback onPress={fecharModal}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
          <View style={s.sheet}>
            <View style={s.handle} />

            {formTipo === null ? (
              <EscolhaTipo onEscolher={setFormTipo} />
            ) : (
              <>
                {/* header do formulário */}
                <View style={s.formHeader}>
                  <TouchableOpacity onPress={() => setFormTipo(null)} style={s.formVoltar}>
                    <IconSymbol name="chevron.left" size={20} color={FIN.textSecondary} />
                  </TouchableOpacity>
                  <Text style={s.formTitulo}>
                    {formTipo === 'ganho' ? '+ Registrar Ganho' : '− Registrar Gasto'}
                  </Text>
                  <TouchableOpacity onPress={fecharModal}>
                    <IconSymbol name="xmark" size={20} color={FIN.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {formTipo === 'ganho' ? (
                    <FormGanhoView form={formGanho} onChange={setFormGanho} onSalvar={salvarGanho} salvando={salvando} />
                  ) : (
                    <FormGastoView form={formGasto} onChange={setFormGasto} onSalvar={salvarGasto} salvando={salvando} />
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

// ─── item da lista ────────────────────────────────────────────────────────────

function ItemCard({ item, onLongPress }: { item: ItemLista; onLongPress: () => void }) {
  const isGanho = item.natureza === 'ganho';
  const cor = isGanho ? FIN.income : FIN.expense;
  const corSurface = isGanho ? FIN.incomeSurface : FIN.expenseSurface;
  const icone = (ICONE_CAT[item.categoria] ?? 'dollarsign.circle.fill') as CategoriaIcone;
  const gasto = item as Gasto;

  return (
    <TouchableOpacity style={s.card} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={[s.cardIconeWrap, { backgroundColor: corSurface }]}>
        <IconSymbol name={icone} size={20} color={cor} />
      </View>
      <View style={s.cardMeio}>
        <Text style={s.cardCategoria}>{item.categoria}</Text>
        <Text style={s.cardSub}>
          {item.tipo}
          {!isGanho && gasto.parcelas > 1 ? ` · ${gasto.parcelas}x` : ''}
          {' · '}
          {isGanho ? (item as Ganho).data : gasto.data_compra}
        </Text>
      </View>
      <View style={s.cardDireita}>
        <Text style={[s.cardValor, { color: cor }]}>
          {isGanho ? '+' : '−'} {fmtMoeda(item.valor)}
        </Text>
        {!isGanho && gasto.parcelas > 1 && (
          <Text style={s.cardParcela}>1/{gasto.parcelas}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── escolha de tipo ──────────────────────────────────────────────────────────

function EscolhaTipo({ onEscolher }: { onEscolher: (t: FormTipo) => void }) {
  return (
    <View style={s.escolha}>
      <Text style={s.escolhaTitulo}>O que deseja registrar?</Text>
      <TouchableOpacity style={[s.escolhaCard, { borderColor: FIN.income }]} onPress={() => onEscolher('ganho')}>
        <View style={[s.escolhaIcone, { backgroundColor: FIN.incomeSurface }]}>
          <IconSymbol name="briefcase.fill" size={26} color={FIN.income} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.escolhaCardTitulo, { color: FIN.income }]}>Registrar Ganho</Text>
          <Text style={s.escolhaCardSub}>Salário, freelance, bônus...</Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={FIN.income} />
      </TouchableOpacity>
      <TouchableOpacity style={[s.escolhaCard, { borderColor: FIN.expense }]} onPress={() => onEscolher('gasto')}>
        <View style={[s.escolhaIcone, { backgroundColor: FIN.expenseSurface }]}>
          <IconSymbol name="doc.text.fill" size={26} color={FIN.expense} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.escolhaCardTitulo, { color: FIN.expense }]}>Registrar Gasto</Text>
          <Text style={s.escolhaCardSub}>Alimentação, contas, lazer...</Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={FIN.expense} />
      </TouchableOpacity>
    </View>
  );
}

// ─── formulários ─────────────────────────────────────────────────────────────

function Label({ t }: { t: string }) {
  return <Text style={s.label}>{t}</Text>;
}

function Campo(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput style={s.input} placeholderTextColor={FIN.textMuted} {...props} />;
}

function Chips({ opcoes, valor, onSelect, cor }: { opcoes: string[]; valor: string; onSelect: (v: string) => void; cor: string }) {
  return (
    <View style={s.chips}>
      {opcoes.map((op) => (
        <TouchableOpacity
          key={op}
          style={[s.chip, valor === op && { backgroundColor: cor, borderColor: cor }]}
          onPress={() => onSelect(op)}
        >
          <Text style={[s.chipTxt, valor === op && s.chipTxtAtivo]}>{op}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BotaoSalvar({ onPress, salvando, cor }: { onPress: () => void; salvando: boolean; cor: string }) {
  return (
    <TouchableOpacity style={[s.botao, { backgroundColor: cor }, salvando && s.botaoOff]} onPress={onPress} disabled={salvando}>
      <Text style={s.botaoTxt}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
    </TouchableOpacity>
  );
}

function FormGanhoView({
  form, onChange, onSalvar, salvando,
}: { form: FormGanho; onChange: React.Dispatch<React.SetStateAction<FormGanho>>; onSalvar: () => void; salvando: boolean }) {
  const set = (p: Partial<FormGanho>) => onChange((f) => ({ ...f, ...p }));
  return (
    <>
      <Label t="Valor *" />
      <Campo placeholder="R$ 0,00" keyboardType="numeric"
        value={form.valor ? `R$ ${form.valor}` : ''}
        onChangeText={(t) => set({ valor: mascaraValor(t.replace('R$ ', '')) })}
      />
      <Label t="Categoria" />
      <Chips opcoes={CAT_GANHO} valor={form.categoria} onSelect={(v) => set({ categoria: v })} cor={FIN.income} />
      <Label t="Tipo" />
      <Chips opcoes={TIPO_GANHO} valor={form.tipo} onSelect={(v) => set({ tipo: v })} cor={FIN.income} />
      <Label t="Data" />
      <Campo placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.data} maxLength={10}
        onChangeText={(t) => set({ data: mascaraData(t) })}
      />
      <BotaoSalvar onPress={onSalvar} salvando={salvando} cor={FIN.income} />
    </>
  );
}

function FormGastoView({
  form, onChange, onSalvar, salvando,
}: { form: FormGasto; onChange: React.Dispatch<React.SetStateAction<FormGasto>>; onSalvar: () => void; salvando: boolean }) {
  const set = (p: Partial<FormGasto>) => onChange((f) => ({ ...f, ...p }));
  return (
    <>
      <Label t="Valor da compra *" />
      <Campo placeholder="R$ 0,00" keyboardType="numeric"
        value={form.valor ? `R$ ${form.valor}` : ''}
        onChangeText={(t) => set({ valor: mascaraValor(t.replace('R$ ', '')) })}
      />
      <Label t="Categoria" />
      <Chips opcoes={CAT_GASTO} valor={form.categoria} onSelect={(v) => set({ categoria: v })} cor={FIN.accent} />
      <Label t="Tipo de pagamento" />
      <Chips opcoes={TIPO_GASTO} valor={form.tipo} onSelect={(v) => set({ tipo: v })} cor={FIN.accent} />
      <Label t="Parcelamento" />
      <View style={s.parcelasRow}>
        <TouchableOpacity style={s.parcelasBtn} onPress={() => set({ parcelas: Math.max(1, form.parcelas - 1) })}>
          <Text style={s.parcelasBtnTxt}>−</Text>
        </TouchableOpacity>
        <Text style={s.parcelasNum}>{form.parcelas}x</Text>
        <TouchableOpacity style={s.parcelasBtn} onPress={() => set({ parcelas: form.parcelas + 1 })}>
          <Text style={s.parcelasBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
      <Label t="Data da compra" />
      <Campo placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.data_compra} maxLength={10}
        onChangeText={(t) => set({ data_compra: mascaraData(t) })}
      />
      <Label t="Data do pagamento (1ª parcela)" />
      <Campo placeholder="DD/MM/AAAA" keyboardType="numeric" value={form.data_pagamento} maxLength={10}
        onChangeText={(t) => set({ data_pagamento: mascaraData(t) })}
      />
      <BotaoSalvar onPress={onSalvar} salvando={salvando} cor={FIN.expense} />
    </>
  );
}

// ─── estilos ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: FIN.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  cabecalhoWrap: { backgroundColor: FIN.bg, paddingTop: 56, paddingBottom: 8 },
  tituloPagina: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: FIN.textPrimary },

  // hero saldo — roxo Nubank (10 % acento dominando este card)
  cardSaldo: {
    backgroundColor: FIN.accent,
    borderRadius: 20,
    padding: 20,
    marginTop: 6,
    marginBottom: 16,
    ...shadowMd,
    shadowColor: FIN.accentDark,
  },
  saldoRotulo: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  saldoValor: { fontSize: 38, fontWeight: '800', letterSpacing: -1.5, marginTop: 2 },
  saldoDetalhes: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  saldoDetalheItem: { flex: 1 },
  saldoDetalheDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  saldoDetalheRotulo: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500', letterSpacing: 0.3 },
  saldoDetalheValor: { fontSize: 16, fontWeight: '700', marginTop: 3 },

  // filtro período
  filtroRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filtroBotao: {
    flex: 1, paddingVertical: 9, borderRadius: 22,
    backgroundColor: FIN.surface, alignItems: 'center',
    borderWidth: 1.5, borderColor: FIN.border,
  },
  filtroBotaoAtivo: { backgroundColor: FIN.accent, borderColor: FIN.accent },
  filtroTexto: { fontSize: 13, fontWeight: '600', color: FIN.textSecondary },
  filtroTextoAtivo: { color: '#fff' },

  // insights
  insightsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: FIN.warningSurface,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)',
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  insightsTexto: { fontSize: 12, color: FIN.warning, flex: 1, fontWeight: '500' },

  // grupos
  grupoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, marginTop: 6 },
  grupoLabel: { fontSize: 11, fontWeight: '700', color: FIN.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  grupoLinha: { flex: 1, height: 1, backgroundColor: FIN.borderLight },

  // card item
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: FIN.surface, borderRadius: 14,
    padding: 13, marginBottom: 8,
    borderWidth: 1, borderColor: FIN.border,
  },
  cardIconeWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardMeio: { flex: 1, gap: 3 },
  cardCategoria: { fontSize: 14, fontWeight: '600', color: FIN.textPrimary },
  cardSub: { fontSize: 12, color: FIN.textMuted },
  cardDireita: { alignItems: 'flex-end', gap: 3 },
  cardValor: { fontSize: 15, fontWeight: '700' },
  cardParcela: { fontSize: 11, color: FIN.textMuted },

  vazio: { textAlign: 'center', marginTop: 48, color: FIN.textMuted, fontSize: 14 },

  // botão registrar
  btnWrap: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  btnRegistrar: {
    backgroundColor: FIN.accent, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...shadowMd, shadowColor: FIN.accentDark,
  },
  btnRegistrarTexto: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },

  // modal base
  overlay: { flex: 1, backgroundColor: FIN.overlay },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: FIN.surfaceHigh, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12, maxHeight: '92%',
  },
  handle: { width: 36, height: 4, backgroundColor: FIN.border, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },

  // escolha
  escolha: { gap: 12, paddingBottom: 8 },
  escolhaTitulo: { fontSize: 19, fontWeight: '700', color: FIN.textPrimary, marginBottom: 6 },
  escolhaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 16, padding: 16,
    backgroundColor: FIN.surface,
  },
  escolhaIcone: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  escolhaCardTitulo: { fontSize: 16, fontWeight: '700' },
  escolhaCardSub: { fontSize: 12, color: FIN.textMuted, marginTop: 2 },

  // form header
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  formVoltar: { padding: 6, marginLeft: -4 },
  formTitulo: { fontSize: 16, fontWeight: '700', color: FIN.textPrimary },

  // form campos
  label: { fontSize: 12, fontWeight: '700', color: FIN.textMuted, marginBottom: 8, marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1.5, borderColor: FIN.border, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: FIN.surface },
  chipTxt: { fontSize: 13, color: FIN.textSecondary, fontWeight: '500' },
  chipTxtAtivo: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1.5, borderColor: FIN.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: FIN.textPrimary, marginBottom: 16, backgroundColor: FIN.surfaceInput,
  },
  parcelasRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 },
  parcelasBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: FIN.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: FIN.border,
  },
  parcelasBtnTxt: { fontSize: 22, color: FIN.textPrimary, lineHeight: 26 },
  parcelasNum: { fontSize: 18, fontWeight: '700', color: FIN.textPrimary, minWidth: 36, textAlign: 'center' },
  botao: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 10, marginBottom: 8 },
  botaoOff: { opacity: 0.55 },
  botaoTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
