import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
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
  atualizarNota,
  atualizarStatusTarefa,
  atualizarTarefa,
  deletarNota,
  deletarTarefa,
  inserirNota,
  inserirTarefa,
  listarNotas,
  listarTodasTarefas,
  type Nota,
  type StatusTarefa,
  type Tarefa,
} from '@/lib/rotina-db';

// ─── paleta trello (70-20-10) ─────────────────────────────────────────────────
// 70 % — fundos escuros neutros
// 20 % — texto e bordas cinza/branco
// 10 % — azul Trello como destaque

const ROT = {
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
  accent:        '#0052CC',
  accentDark:    '#0747A6',
  accentSurface: 'rgba(0, 82, 204, 0.15)',

  // semânticos visíveis em fundo escuro
  task:        '#4C9AFF',
  taskSurface: 'rgba(76, 154, 255, 0.12)',

  warning:        '#FFAB00',
  warningSurface: 'rgba(255, 171, 0, 0.1)',

  statusPending: '#525252',
  statusDoing:   '#FFAB00',
  statusDone:    '#36B37E',

  overlay: 'rgba(0, 0, 0, 0.75)',
} as const;

// ─── helpers ──────────────────────────────────────────────────────────────────

function dataHoje(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function dataHojeExtenso(): string {
  const d = new Date();
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
}

function mascaraData(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function fmtDataNota(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  const agora = new Date();
  const isHoje = d.getDate() === agora.getDate() && d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  if (isHoje) return 'Hoje';
  const ontem = new Date(agora);
  ontem.setDate(ontem.getDate() - 1);
  if (d.getDate() === ontem.getDate() && d.getMonth() === ontem.getMonth()) return 'Ontem';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const PROXIMO_STATUS: Record<StatusTarefa, StatusTarefa> = {
  pendente: 'fazendo',
  fazendo: 'concluido',
  concluido: 'pendente',
};

const STATUS_LABEL: Record<StatusTarefa, string> = {
  pendente: 'Pendente',
  fazendo: 'Em andamento',
  concluido: 'Concluída',
};

// ─── tela principal ───────────────────────────────────────────────────────────

type EditorNota = { aberta: boolean; nota: Nota | null };
type EditorTarefa = { aberta: boolean; tarefa: Tarefa | null };

export default function RotinaScreen() {
  const hoje = dataHoje();

  const [todasTarefas, setTodasTarefas] = useState<Tarefa[]>(() => listarTodasTarefas());
  const [notas, setNotas] = useState<Nota[]>(() => listarNotas());
  const [busca, setBusca] = useState('');
  const [novaTarefa, setNovaTarefa] = useState('');

  const [escolhaAberta, setEscolhaAberta] = useState(false);
  const [editorTarefa, setEditorTarefa] = useState<EditorTarefa>({ aberta: false, tarefa: null });
  const [editorNota, setEditorNota] = useState<EditorNota>({ aberta: false, nota: null });

  const quickAddRef = useRef<TextInput>(null);

  const recarregar = useCallback(() => {
    setTodasTarefas(listarTodasTarefas());
    setNotas(listarNotas());
  }, []);

  // ── filtragem ──────────────────────────────────────────────────────────────

  const q = busca.trim().toLowerCase();

  const tarefasExibidas = useMemo(() => {
    const base = q
      ? todasTarefas.filter((t) => t.titulo.toLowerCase().includes(q))
      : todasTarefas.filter((t) => t.data === hoje);
    return [...base].sort((a, b) => {
      const ordem = { pendente: 0, fazendo: 1, concluido: 2 };
      return ordem[a.status] - ordem[b.status];
    });
  }, [todasTarefas, q, hoje]);

  const notasExibidas = useMemo(() => {
    if (!q) return notas;
    return notas.filter(
      (n) => n.titulo.toLowerCase().includes(q) || n.conteudo.toLowerCase().includes(q)
    );
  }, [notas, q]);

  // ── tarefas ────────────────────────────────────────────────────────────────

  function criarTarefaRapida() {
    if (!novaTarefa.trim()) return;
    inserirTarefa({ titulo: novaTarefa.trim(), status: 'pendente', data: hoje });
    setNovaTarefa('');
    recarregar();
  }

  function ciclarStatus(tarefa: Tarefa) {
    if (!tarefa.id) return;
    atualizarStatusTarefa(tarefa.id, PROXIMO_STATUS[tarefa.status]);
    recarregar();
  }

  function abrirEditorTarefa(tarefa: Tarefa | null) {
    setEditorTarefa({ aberta: true, tarefa });
  }

  function confirmarDeletarTarefa(id: number) {
    Alert.alert('Remover tarefa', 'Deseja remover esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { deletarTarefa(id); recarregar(); } },
    ]);
  }

  // ── notas ──────────────────────────────────────────────────────────────────

  function abrirEditorNota(nota: Nota | null) {
    setEscolhaAberta(false);
    setEditorNota({ aberta: true, nota });
  }

  function salvarNota(titulo: string, conteudo: string) {
    if (!titulo.trim() && !conteudo.trim()) {
      setEditorNota({ aberta: false, nota: null });
      return;
    }
    if (editorNota.nota?.id) {
      atualizarNota(editorNota.nota.id, titulo.trim(), conteudo);
    } else {
      inserirNota(titulo.trim() || 'Sem título', conteudo);
    }
    recarregar();
    setEditorNota({ aberta: false, nota: null });
  }

  function confirmarDeletarNota(id: number) {
    Alert.alert('Remover nota', 'Deseja remover esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { deletarNota(id); recarregar(); } },
    ]);
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <ThemedView style={s.tela} lightColor={ROT.bg} darkColor={ROT.bg}>

      {/* busca */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color={ROT.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar tarefas e notas..."
            placeholderTextColor={ROT.textMuted}
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <IconSymbol name="xmark" size={14} color={ROT.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── seção atividades ─── */}
        <View style={s.secaoHeader}>
          <Text style={s.secaoTitulo}>Atividades</Text>
          {!q && <Text style={s.secaoSub}>{dataHojeExtenso()}</Text>}
        </View>

        {/* quick add */}
        {!q && (
          <View style={s.quickAdd}>
            <TextInput
              ref={quickAddRef}
              style={s.quickAddInput}
              placeholder="Nova tarefa..."
              placeholderTextColor={ROT.textMuted}
              value={novaTarefa}
              onChangeText={setNovaTarefa}
              onSubmitEditing={criarTarefaRapida}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            {novaTarefa.trim().length > 0 && (
              <TouchableOpacity style={s.quickAddBtn} onPress={criarTarefaRapida}>
                <IconSymbol name="plus" size={18} color={ROT.task} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {tarefasExibidas.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="list.bullet" size={28} color={ROT.border} />
            <Text style={s.emptyText}>
              {q ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa para hoje'}
            </Text>
          </View>
        ) : (
          tarefasExibidas.map((t) => (
            <TarefaCard
              key={t.id}
              tarefa={t}
              onCiclarStatus={() => ciclarStatus(t)}
              onEditar={() => abrirEditorTarefa(t)}
              onDeletar={() => t.id && confirmarDeletarTarefa(t.id)}
              hoje={hoje}
            />
          ))
        )}

        {/* ─── seção notas ─── */}
        <View style={[s.secaoHeader, { marginTop: 24 }]}>
          <Text style={s.secaoTitulo}>Notas</Text>
          <TouchableOpacity
            style={s.notaNovaBotao}
            onPress={() => abrirEditorNota(null)}
          >
            <IconSymbol name="plus" size={14} color={ROT.task} />
            <Text style={s.notaNovaTxt}>Nova nota</Text>
          </TouchableOpacity>
        </View>

        {notasExibidas.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="note.text" size={28} color={ROT.border} />
            <Text style={s.emptyText}>
              {q ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
            </Text>
          </View>
        ) : (
          notasExibidas.map((n) => (
            <NotaCard
              key={n.id}
              nota={n}
              onPress={() => abrirEditorNota(n)}
              onDeletar={() => n.id && confirmarDeletarNota(n.id)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* botão criar */}
      <View style={s.btnWrap}>
        <TouchableOpacity style={s.btnCriar} onPress={() => setEscolhaAberta(true)} activeOpacity={0.88}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.btnCriarTxt}>Criar</Text>
        </TouchableOpacity>
      </View>

      {/* modal escolha */}
      <Modal visible={escolhaAberta} animationType="slide" transparent onRequestClose={() => setEscolhaAberta(false)}>
        <TouchableWithoutFeedback onPress={() => setEscolhaAberta(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.escolhaTitulo}>O que deseja criar?</Text>
          <TouchableOpacity
            style={[s.escolhaCard, { borderColor: ROT.task }]}
            onPress={() => { setEscolhaAberta(false); abrirEditorTarefa(null); }}
          >
            <View style={[s.escolhaIcone, { backgroundColor: ROT.taskSurface }]}>
              <IconSymbol name="list.bullet" size={24} color={ROT.task} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.escolhaCardTitulo, { color: ROT.task }]}>Nova Tarefa</Text>
              <Text style={s.escolhaCardSub}>Adicionar à rotina do dia</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={ROT.task} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.escolhaCard, { borderColor: ROT.warning }]}
            onPress={() => abrirEditorNota(null)}
          >
            <View style={[s.escolhaIcone, { backgroundColor: ROT.warningSurface }]}>
              <IconSymbol name="note.text" size={24} color={ROT.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.escolhaCardTitulo, { color: ROT.warning }]}>Nova Nota</Text>
              <Text style={s.escolhaCardSub}>Capturar ideia ou informação</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={ROT.warning} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* modal editor tarefa */}
      <TarefaEditorModal
        estado={editorTarefa}
        hoje={hoje}
        onFechar={() => setEditorTarefa({ aberta: false, tarefa: null })}
        onSalvar={(titulo, data) => {
          if (editorTarefa.tarefa?.id) {
            atualizarTarefa(editorTarefa.tarefa.id, titulo, data);
          } else {
            inserirTarefa({ titulo, status: 'pendente', data });
          }
          recarregar();
          setEditorTarefa({ aberta: false, tarefa: null });
        }}
      />

      {/* editor nota (full screen) */}
      <Modal
        visible={editorNota.aberta}
        animationType="slide"
        onRequestClose={() => setEditorNota({ aberta: false, nota: null })}
      >
        <NotaEditor
          nota={editorNota.nota}
          onFechar={() => setEditorNota({ aberta: false, nota: null })}
          onSalvar={salvarNota}
        />
      </Modal>
    </ThemedView>
  );
}

// ─── card de tarefa ───────────────────────────────────────────────────────────

function TarefaCard({ tarefa, onCiclarStatus, onEditar, onDeletar, hoje }: {
  tarefa: Tarefa;
  onCiclarStatus: () => void;
  onEditar: () => void;
  onDeletar: () => void;
  hoje: string;
}) {
  const concluida = tarefa.status === 'concluido';
  return (
    <TouchableOpacity
      style={[s.tarefaCard, concluida && s.tarefaCardConcluida]}
      onPress={onEditar}
      onLongPress={onDeletar}
      activeOpacity={0.7}
    >
      <TouchableOpacity onPress={onCiclarStatus} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <StatusCircle status={tarefa.status} />
      </TouchableOpacity>
      <View style={s.tarefaMeio}>
        <Text style={[s.tarefaTitulo, concluida && s.tarefaTituloRiscado]} numberOfLines={2}>
          {tarefa.titulo}
        </Text>
        <Text style={[s.tarefaStatusTxt, { color: STATUS_COR[tarefa.status] }]}>
          {STATUS_LABEL[tarefa.status]}
          {tarefa.data !== hoje ? ` · ${tarefa.data}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const STATUS_COR: Record<StatusTarefa, string> = {
  pendente:  ROT.statusPending,
  fazendo:   ROT.statusDoing,
  concluido: ROT.statusDone,
};

function StatusCircle({ status }: { status: StatusTarefa }) {
  if (status === 'pendente') {
    return <View style={s.circulo} />;
  }
  if (status === 'fazendo') {
    return (
      <View style={[s.circulo, s.circuloFazendo]}>
        <View style={s.pontoCentral} />
      </View>
    );
  }
  return (
    <View style={[s.circulo, s.circuloConcluido]}>
      <Text style={s.checkmark}>✓</Text>
    </View>
  );
}

// ─── card de nota ─────────────────────────────────────────────────────────────

function NotaCard({ nota, onPress, onDeletar }: { nota: Nota; onPress: () => void; onDeletar: () => void }) {
  const temTitulo = nota.titulo.trim().length > 0;
  const temConteudo = nota.conteudo.trim().length > 0;
  return (
    <TouchableOpacity style={s.notaCard} onPress={onPress} onLongPress={onDeletar} activeOpacity={0.7}>
      <View style={s.notaCardTopo}>
        <Text style={s.notaTitulo} numberOfLines={1}>
          {temTitulo ? nota.titulo : 'Sem título'}
        </Text>
        <Text style={s.notaData}>{fmtDataNota(nota.atualizado_em)}</Text>
      </View>
      {temConteudo && (
        <Text style={s.notaPreview} numberOfLines={2}>{nota.conteudo}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── modal editor de tarefa ───────────────────────────────────────────────────

function TarefaEditorModal({ estado, hoje, onFechar, onSalvar }: {
  estado: EditorTarefa;
  hoje: string;
  onFechar: () => void;
  onSalvar: (titulo: string, data: string) => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(hoje);

  const ehEdicao = estado.tarefa !== null;

  if (estado.aberta && estado.tarefa && titulo !== estado.tarefa.titulo) {
    setTitulo(estado.tarefa.titulo);
    setData(estado.tarefa.data);
  }
  if (estado.aberta && !estado.tarefa && titulo !== '') {
    setTitulo('');
    setData(hoje);
  }

  function salvar() {
    if (!titulo.trim()) return Alert.alert('Atenção', 'Informe o título da tarefa.');
    onSalvar(titulo.trim(), data);
    setTitulo('');
    setData(hoje);
  }

  return (
    <Modal visible={estado.aberta} animationType="slide" transparent onRequestClose={onFechar}>
      <TouchableWithoutFeedback onPress={onFechar}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitulo}>{ehEdicao ? 'Editar tarefa' : 'Nova tarefa'}</Text>
            <TouchableOpacity onPress={onFechar}>
              <IconSymbol name="xmark" size={20} color={ROT.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={s.label}>Título</Text>
          <TextInput
            style={s.input}
            placeholder="O que precisa fazer?"
            placeholderTextColor={ROT.textMuted}
            value={titulo}
            onChangeText={setTitulo}
            autoFocus={!ehEdicao}
            returnKeyType="done"
          />
          <Text style={s.label}>Data</Text>
          <TextInput
            style={s.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={ROT.textMuted}
            keyboardType="numeric"
            value={data}
            onChangeText={(t) => setData(mascaraData(t))}
            maxLength={10}
          />
          <TouchableOpacity style={s.botaoSalvar} onPress={salvar}>
            <Text style={s.botaoSalvarTxt}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── editor de nota (tela cheia) ──────────────────────────────────────────────

function NotaEditor({ nota, onFechar, onSalvar }: {
  nota: Nota | null;
  onFechar: () => void;
  onSalvar: (titulo: string, conteudo: string) => void;
}) {
  const [titulo, setTitulo] = useState(nota?.titulo ?? '');
  const [conteudo, setConteudo] = useState(nota?.conteudo ?? '');

  const notaId = nota?.id ?? null;
  const prevId = useRef<number | null>(notaId);
  if (prevId.current !== notaId) {
    prevId.current = notaId;
    setTitulo(nota?.titulo ?? '');
    setConteudo(nota?.conteudo ?? '');
  }

  return (
    <SafeAreaView style={s.editorTela}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* header */}
        <View style={s.editorHeader}>
          <TouchableOpacity onPress={onFechar} style={s.editorHeaderBtn}>
            <IconSymbol name="xmark" size={20} color={ROT.textSecondary} />
          </TouchableOpacity>
          <Text style={s.editorHeaderTitulo}>{nota ? 'Editar nota' : 'Nova nota'}</Text>
          <TouchableOpacity
            style={[s.editorHeaderBtn, s.editorSalvarBtn]}
            onPress={() => onSalvar(titulo, conteudo)}
          >
            <Text style={s.editorSalvarTxt}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <View style={s.editorDivider} />

        {/* campos */}
        <ScrollView
          style={s.editorScroll}
          contentContainerStyle={s.editorScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={s.editorTitulo}
            placeholder="Título"
            placeholderTextColor={ROT.border}
            value={titulo}
            onChangeText={setTitulo}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <View style={s.editorSeparador} />
          <TextInput
            style={s.editorCorpo}
            placeholder="Escreva aqui..."
            placeholderTextColor={ROT.border}
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            textAlignVertical="top"
            autoFocus={!nota}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: ROT.bg },

  // busca
  searchContainer: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: ROT.bg,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ROT.surface, borderRadius: 13,
    paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1.5, borderColor: ROT.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: ROT.textPrimary, padding: 0 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  // seção
  secaoHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  secaoTitulo: { fontSize: 18, fontWeight: '700', color: ROT.textPrimary, letterSpacing: -0.3 },
  secaoSub: { fontSize: 12, color: ROT.textMuted, fontWeight: '600', letterSpacing: 0.2 },

  // quick add
  quickAdd: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: ROT.surface, borderRadius: 13,
    paddingHorizontal: 14, paddingVertical: 2,
    marginBottom: 10, borderWidth: 1.5, borderColor: ROT.border,
  },
  quickAddInput: { flex: 1, fontSize: 14, color: ROT.textPrimary, paddingVertical: 12 },
  quickAddBtn: { padding: 6 },

  // tarefa card
  tarefaCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: ROT.surface, borderRadius: 14,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: ROT.border,
  },
  tarefaCardConcluida: { opacity: 0.45 },
  tarefaMeio: { flex: 1, gap: 3 },
  tarefaTitulo: { fontSize: 15, fontWeight: '500', color: ROT.textPrimary, lineHeight: 21 },
  tarefaTituloRiscado: { textDecorationLine: 'line-through', color: ROT.textMuted },
  tarefaStatusTxt: { fontSize: 12, fontWeight: '600' },

  // status circle
  circulo: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: ROT.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  circuloFazendo: { borderColor: ROT.statusDoing },
  pontoCentral: { width: 9, height: 9, borderRadius: 5, backgroundColor: ROT.statusDoing },
  circuloConcluido: { backgroundColor: ROT.statusDone, borderColor: ROT.statusDone },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 14 },

  // nota card — acento âmbar Trello à esquerda
  notaCard: {
    backgroundColor: ROT.surface,
    borderRadius: 14, padding: 14,
    marginBottom: 10, gap: 6,
    borderLeftWidth: 3, borderLeftColor: ROT.warning,
    borderWidth: 1, borderColor: ROT.border,
  },
  notaCardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notaTitulo: { fontSize: 14, fontWeight: '600', color: ROT.textPrimary, flex: 1 },
  notaData: { fontSize: 11, color: ROT.textMuted, marginLeft: 8, fontWeight: '500' },
  notaPreview: { fontSize: 13, color: ROT.textSecondary, lineHeight: 19 },

  // nota botão nova
  notaNovaBotao: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notaNovaTxt: { fontSize: 13, fontWeight: '600', color: ROT.task },

  // empty state
  empty: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 14, color: ROT.textMuted, textAlign: 'center' },

  // botão criar — azul Trello (10 % acento)
  btnWrap: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  btnCriar: {
    backgroundColor: ROT.accent, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...shadowMd, shadowColor: ROT.accentDark,
  },
  btnCriarTxt: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },

  // modal base
  overlay: { flex: 1, backgroundColor: ROT.overlay },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: ROT.surfaceHigh, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
  },
  handle: { width: 36, height: 4, backgroundColor: ROT.border, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitulo: { fontSize: 17, fontWeight: '700', color: ROT.textPrimary },

  // escolha modal
  escolhaTitulo: { fontSize: 19, fontWeight: '700', color: ROT.textPrimary, marginBottom: 16 },
  escolhaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 16, padding: 16, marginBottom: 12,
    backgroundColor: ROT.surface,
  },
  escolhaIcone: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  escolhaCardTitulo: { fontSize: 16, fontWeight: '700' },
  escolhaCardSub: { fontSize: 12, color: ROT.textMuted, marginTop: 2 },

  // form inputs
  label: { fontSize: 12, fontWeight: '700', color: ROT.textMuted, marginBottom: 8, marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    borderWidth: 1.5, borderColor: ROT.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: ROT.textPrimary, marginBottom: 16, backgroundColor: ROT.surfaceInput,
  },
  botaoSalvar: { backgroundColor: ROT.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  botaoSalvarTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // editor nota
  editorTela: { flex: 1, backgroundColor: ROT.surfaceHigh },
  editorHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: ROT.borderLight,
  },
  editorHeaderBtn: { padding: 4, minWidth: 44, alignItems: 'center' },
  editorHeaderTitulo: { fontSize: 15, fontWeight: '600', color: ROT.textSecondary },
  editorSalvarBtn: {
    backgroundColor: ROT.accent, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7, minWidth: 0,
  },
  editorSalvarTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  editorDivider: { height: 1, backgroundColor: ROT.borderLight },
  editorScroll: { flex: 1 },
  editorScrollContent: { padding: 22, paddingBottom: 60 },
  editorTitulo: {
    fontSize: 24, fontWeight: '700', color: ROT.textPrimary,
    paddingVertical: 0, marginBottom: 16, letterSpacing: -0.3,
  },
  editorSeparador: { height: 1, backgroundColor: ROT.borderLight, marginBottom: 18 },
  editorCorpo: {
    fontSize: 16, color: ROT.textSecondary, lineHeight: 26,
    minHeight: 300, paddingVertical: 0,
  },
});
