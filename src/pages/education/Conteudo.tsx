import { useState } from "react";
import { readKanbanConfig, KANBAN_KEYS, KANBAN_COR_DOT } from "../../hooks/useKanbanConfig";
import { Layers, Globe, Star, Download, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { NovoConteudoModal } from "../../components/ui/modals/education/NovoConteudoModal";
import { ConteudoKPIs } from "./components/Conteudo/ConteudoKPIs";
import { ConteudoFilters } from "./components/Conteudo/ConteudoFilters";
import { ConteudoTable } from "./components/Conteudo/ConteudoTable";
import { ConteudoKanban } from "./components/Conteudo/ConteudoKanban";
import type { DropResult } from "@hello-pangea/dnd";

interface ContentItem {
  id: string;
  title: string;
  type: "Video" | "PDF" | "Quiz" | "Artigo";
  module: string;
  course: string;
  duration?: string;
  lastUpdate: string;
  accessCount: number;
  status: "Publicado" | "Rascunho" | "Em Revisão" | "Arquivado";
}

export default function Conteudo() {
  const [viewMode, setViewMode] = useState<"Table" | "Kanban">("Kanban");
  const [content, setContent] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem("axis_edu_content");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const saveContent = (updated: ContentItem[]) => {
    setContent(updated);
    try { localStorage.setItem("axis_edu_content", JSON.stringify(updated)); } catch (e) {}
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as ContentItem["status"];
    saveContent(content.map(item => item.id === result.draggableId ? { ...item, status: newStatus } : item));
    toast.success(`Material movido para ${newStatus}`);
  };

  const handleOpenEdit = (item: ContentItem) => { setEditingItem(item); setIsModalOpen(true); };
  const handleClose = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleSubmit = (data: { title: string; type: ContentItem["type"]; duration: string; course: string; module: string; status: ContentItem["status"] }) => {
    if (editingItem) {
      saveContent(content.map(item => item.id === editingItem.id ? { ...item, ...data, duration: data.duration || undefined } : item));
      toast.success("Material atualizado com sucesso!");
    } else {
      saveContent([{
        id: Math.random().toString(36).substring(2, 9),
        ...data,
        duration: data.duration || undefined,
        lastUpdate: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
        accessCount: 0,
      }, ...content]);
      toast.success("Material adicionado com sucesso!");
    }
    handleClose();
  };

  const typeMap: Record<string, string> = { "Vídeo": "Video", "PDF": "PDF", "Quiz": "Quiz" };
  const filteredContent = content.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.course.toLowerCase().includes(search.toLowerCase()) ||
      c.module.toLowerCase().includes(search.toLowerCase());
    if (selectedCategory === "Todos") return matchesSearch;
    return matchesSearch && c.type === typeMap[selectedCategory];
  });

  const columns = readKanbanConfig(KANBAN_KEYS.educacao).map(c => ({
    id: c.id as ContentItem["status"],
    label: c.nome,
    dotColor: KANBAN_COR_DOT[c.cor] ?? KANBAN_COR_DOT.slate,
  }));

  const totalAcessos = content.reduce((acc, c) => acc + (c.accessCount || 0), 0);
  const totalAcessosFmt = totalAcessos >= 1000 ? `${(totalAcessos / 1000).toFixed(1)}k` : String(totalAcessos);
  const kpiStats = [
    { label: "Ativos Totais", value: String(content.length), icon: Layers, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Total Acessos", value: content.length === 0 ? "—" : totalAcessosFmt, icon: Globe, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Publicados", value: String(content.filter(c => c.status === "Publicado").length), icon: Star, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { label: "Em Rascunho", value: String(content.filter(c => c.status === "Rascunho").length), icon: Download, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
  ];

  return (
    <PageContainer
      title="Repositório de Conteúdo Axis"
      description="Gestão centralizada de ativos educacionais e trilhas de aprendizagem de alta performance."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-11 px-6 rounded-2xl gap-2">
            <Download className="w-4 h-4" /> Exportar Lote
          </Button>
          <Button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white h-11 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Material
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">
        <ConteudoKPIs stats={kpiStats} />
        <ConteudoFilters
          search={search} onSearchChange={setSearch}
          selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
          viewMode={viewMode} onViewModeChange={setViewMode}
        />
        {viewMode === "Table" ? (
          <ConteudoTable items={filteredContent} onEdit={handleOpenEdit} />
        ) : (
          <ConteudoKanban columns={columns} items={filteredContent} onDragEnd={handleDragEnd} onEdit={handleOpenEdit} />
        )}
      </div>
      <NovoConteudoModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        editingTitle={editingItem?.title}
        initialValues={editingItem ? {
          title: editingItem.title, type: editingItem.type,
          duration: editingItem.duration || "", course: editingItem.course,
          module: editingItem.module, status: editingItem.status,
        } : undefined}
      />
    </PageContainer>
  );
}
