import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, GripVertical, Pencil, Trash2, Save, Columns3, BookOpen, CheckSquare, Zap } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../../contexts/DataContext";
import {
  KanbanColConfig,
  KANBAN_KEYS,
  KANBAN_DEFAULTS,
  KANBAN_COR_DOT,
  KANBAN_COR_TOP,
  readKanbanConfig,
  writeKanbanConfig,
} from "../../../hooks/useKanbanConfig";

// ─── Colors ───────────────────────────────────────────────────────────────────

const CORES_LISTA = ["blue", "orange", "cyan", "emerald", "purple", "rose", "amber", "indigo", "pink", "slate"];

// ─── Column Card ──────────────────────────────────────────────────────────────

function ColCard({
  col, idx, dragHandleProps, onRename, onDelete, onUpdate, onColorChange, canDelete,
}: {
  col: KanbanColConfig;
  idx: number;
  dragHandleProps?: any;
  onRename: (nome: string) => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<KanbanColConfig>) => void;
  onColorChange: (cor: string) => void;
  canDelete: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(col.nome);
  const [showPicker, setShowPicker] = useState(false);

  const dotColor = KANBAN_COR_DOT[col.cor] ?? KANBAN_COR_DOT.slate;
  const topColor = KANBAN_COR_TOP[col.cor] ?? KANBAN_COR_TOP.slate;

  const save = () => {
    if (nome.trim()) onRename(nome.trim());
    else setNome(col.nome);
    setEditing(false);
  };

  return (
    <div
      className="flex-shrink-0 w-[200px] rounded-2xl border border-white/10 bg-[#0B1120] flex flex-col relative"
      style={{ borderTop: `4px solid ${topColor}` }}
    >
      <div className="p-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span
            {...(dragHandleProps ?? {})}
            className="cursor-grab active:cursor-grabbing p-0.5 rounded text-slate-600 hover:text-slate-400 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded">
              <Pencil className="w-3 h-3" />
            </button>
            {canDelete && (
              <button onClick={onDelete} className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-shrink-0 z-20">
            <button
              onClick={() => setShowPicker(v => !v)}
              className="w-3 h-3 rounded-full transition-all hover:ring-2 hover:ring-white/30"
              style={{ backgroundColor: dotColor }}
            />
            {showPicker && (
              <div className="absolute top-5 left-0 z-[100] p-2 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl grid grid-cols-5 gap-1.5 w-[116px]">
                {CORES_LISTA.map(cor => (
                  <button
                    key={cor}
                    onClick={() => { onColorChange(cor); setShowPicker(false); }}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110 border-2"
                    style={{
                      backgroundColor: KANBAN_COR_DOT[cor],
                      borderColor: col.cor === cor ? "#fff" : "transparent",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {editing ? (
            <input
              autoFocus
              value={nome}
              onChange={e => setNome(e.target.value)}
              onBlur={save}
              onKeyDown={e => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") { setNome(col.nome); setEditing(false); }
              }}
              className="text-xs font-bold bg-transparent border-b border-blue-500 text-white outline-none flex-1 min-w-0"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-white truncate text-left hover:text-blue-300 transition-colors flex-1 min-w-0"
            >
              {col.nome}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 rounded-lg bg-white/[0.04] border border-white/5" />
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 px-3 py-2.5 flex items-center justify-between">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Minimizado</span>
        <button
          onClick={() => onUpdate({ iniciarMinimizado: !col.iniciarMinimizado })}
          className={`relative w-8 h-4 rounded-full transition-colors ${col.iniciarMinimizado ? "bg-blue-500" : "bg-white/10"}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${col.iniciarMinimizado ? "left-[18px]" : "left-0.5"}`} />
        </button>
      </div>
      <div className="px-3 pb-2.5">
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Coluna {idx + 1}</span>
      </div>
    </div>
  );
}

// ─── Board types ──────────────────────────────────────────────────────────────

type BoardKey = 'marketing' | 'educacao' | 'tarefas' | 'sprint';

const BOARDS: { key: BoardKey; label: string; icon: React.ReactNode; description: string; canAddRemove: boolean }[] = [
  {
    key: 'marketing',
    label: 'Marketing Conteúdo',
    icon: <Zap className="w-4 h-4" />,
    description: 'Quadro kanban da página de gestão de pautas e conteúdo de marketing.',
    canAddRemove: true,
  },
  {
    key: 'educacao',
    label: 'Conteúdo Educacional',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Quadro kanban do repositório de materiais educacionais.',
    canAddRemove: false,
  },
  {
    key: 'tarefas',
    label: 'Tarefas',
    icon: <CheckSquare className="w-4 h-4" />,
    description: 'Quadro kanban da página de tarefas operacionais.',
    canAddRemove: false,
  },
  {
    key: 'sprint',
    label: 'Sprint (Dev)',
    icon: <Columns3 className="w-4 h-4" />,
    description: 'Quadro kanban do painel de sprints de desenvolvimento.',
    canAddRemove: true,
  },
];

// ─── Board Editor ─────────────────────────────────────────────────────────────

function BoardEditor({ boardKey, canAddRemove }: { boardKey: BoardKey; canAddRemove: boolean }) {
  const { saveAppSetting } = useData();
  const storageKey = KANBAN_KEYS[boardKey];

  const [cols, setCols] = useState<KanbanColConfig[]>(() => readKanbanConfig(storageKey));
  const [saving, setSaving] = useState(false);

  const persist = (next: KanbanColConfig[]) => setCols(next);

  const handleSave = async () => {
    setSaving(true);
    writeKanbanConfig(storageKey, cols);
    try { await saveAppSetting(storageKey, cols); } catch { }
    setSaving(false);
    toast.success("Configuração do kanban salva!");
  };

  const handleReset = () => {
    const defaults = KANBAN_DEFAULTS[storageKey] ?? [];
    setCols(defaults);
    toast.info("Colunas redefinidas para o padrão.");
  };

  const handleRename = (idx: number, nome: string) => {
    persist(cols.map((c, i) => i === idx ? { ...c, nome } : c));
  };

  const handleColorChange = (idx: number, cor: string) => {
    persist(cols.map((c, i) => i === idx ? { ...c, cor } : c));
  };

  const handleUpdate = (idx: number, patch: Partial<KanbanColConfig>) => {
    persist(cols.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const handleDelete = (idx: number) => {
    persist(cols.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    const newId = `col_${Date.now()}`;
    const newCol: KanbanColConfig = {
      id: newId,
      nome: `Nova Coluna ${cols.length + 1}`,
      cor: CORES_LISTA[cols.length % CORES_LISTA.length],
      iniciarMinimizado: false,
    };
    persist([...cols, newCol]);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const next = [...cols];
    const [removed] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, removed);
    persist(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {canAddRemove && (
            <Button onClick={handleAdd} className="bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest h-9 px-4 gap-2 rounded-xl shadow-none">
              <Plus className="w-3.5 h-3.5" /> Adicionar Coluna
            </Button>
          )}
          <button
            onClick={handleReset}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
          >
            Redefinir padrão
          </button>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 h-9 gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`board-${boardKey}`} direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-3 min-w-max"
              >
                {cols.map((col, idx) => (
                  <Draggable key={`${boardKey}-${col.id}-${idx}`} draggableId={`${boardKey}-${col.id}-${idx}`} index={idx}>
                    {(drag, snapshot) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={snapshot.isDragging ? "opacity-80 rotate-1 scale-105" : ""}
                      >
                        <ColCard
                          col={col}
                          idx={idx}
                          dragHandleProps={drag.dragHandleProps}
                          onRename={(nome) => handleRename(idx, nome)}
                          onDelete={() => handleDelete(idx)}
                          onUpdate={(patch) => handleUpdate(idx, patch)}
                          onColorChange={(cor) => handleColorChange(idx, cor)}
                          canDelete={canAddRemove}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {canAddRemove && (
                  <button
                    onClick={handleAdd}
                    className="flex-shrink-0 w-[200px] rounded-2xl border border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center min-h-[220px] gap-2 text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Coluna</span>
                  </button>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {!canAddRemove && (
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          * As colunas deste quadro são fixas. Você pode renomear, reordenar e alterar cores, mas não adicionar ou remover colunas.
        </p>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ConfigKanbanBoards() {
  const [activeBoard, setActiveBoard] = useState<BoardKey>('marketing');
  const board = BOARDS.find(b => b.key === activeBoard)!;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Funis / Kanbans</h1>
        <p className="text-sm text-slate-400">Configure as colunas dos quadros kanban de cada módulo da plataforma.</p>
      </div>

      {/* Board Tabs */}
      <div className="flex flex-wrap gap-2">
        {BOARDS.map(b => (
          <button
            key={b.key}
            onClick={() => setActiveBoard(b.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              activeBoard === b.key
                ? "bg-blue-600/10 border-blue-500/40 text-blue-400"
                : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {b.icon}
            {b.label}
          </button>
        ))}
      </div>

      {/* Active Board Card */}
      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            {board.icon}
          </div>
          <div>
            <div className="font-black text-white text-sm uppercase tracking-tight">{board.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{board.description}</div>
          </div>
        </div>

        <BoardEditor key={activeBoard} boardKey={activeBoard} canAddRemove={board.canAddRemove} />
      </Card>
    </div>
  );
}
