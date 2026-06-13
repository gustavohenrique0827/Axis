import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Clock, ChevronRight, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable as DraggableOrig,
  DropResult,
} from "@hello-pangea/dnd";
const Draggable = DraggableOrig as any;

interface ContentItem {
  id: string;
  title: string;
  type: "Video" | "PDF" | "Quiz" | "Artigo";
  module: string;
  course: string;
  lastUpdate: string;
  accessCount: number;
  status: "Publicado" | "Rascunho" | "Em Revisão" | "Arquivado";
}

interface KanbanColumn {
  id: ContentItem["status"];
  label: string;
  dotColor: string;
}

interface ConteudoKanbanProps {
  columns: KanbanColumn[];
  items: ContentItem[];
  onDragEnd: (result: DropResult) => void;
  onEdit: (item: ContentItem) => void;
}

export function ConteudoKanban({ columns, items, onDragEnd, onEdit }: ConteudoKanbanProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dotColor }} />
                {col.label}
              </h4>
              <Badge className="bg-white/5 border-white/5 text-slate-600 text-[9px] font-bold">
                {items.filter((c) => c.status === col.id).length}
              </Badge>
            </div>

            <Droppable droppableId={col.id}>
              {(provided: any, snapshot: any) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`min-h-[600px] rounded-[24px] transition-colors p-2 ${snapshot.isDraggingOver ? "bg-white/[0.03]" : "bg-transparent"}`}
                >
                  {items.filter((c) => c.status === col.id).map((item, idx) => (
                    <Draggable key={item.id} draggableId={item.id} index={idx}>
                      {(provided: any, snapshot: any) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-4">
                          <Card className={`p-5 bg-[#111827] border-white/5 hover:border-white/10 transition-all ${snapshot.isDragging ? "rotate-2 scale-105 shadow-2xl z-50 border-blue-500/50" : ""}`}>
                            <div className="flex justify-between items-start mb-4">
                              <div {...provided.dragHandleProps} className="p-1 rounded hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-4 h-4 text-slate-700" />
                              </div>
                              <Badge className="bg-white/5 border-white/5 text-slate-500 text-[8px] font-black uppercase">
                                {item.type}
                              </Badge>
                            </div>
                            <h5 className="text-sm font-black text-white italic uppercase leading-tight mb-3">{item.title}</h5>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate mb-4">{item.course}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-3 h-3" />
                                <span className="text-[9px] font-bold font-mono">{item.lastUpdate}</span>
                              </div>
                              <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-blue-400">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
