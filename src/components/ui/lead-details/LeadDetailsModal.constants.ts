import { Clock, Flame, Info, MessageCircle, Package, ScrollText, Sun, Zap, StickyNote, ListTodo } from "lucide-react";

export const LeadDetailsModalTabs = [
  { id: "informacoes", label: "Informações",  short: "INFO",     icon: Info          },
  { id: "notas",       label: "Notas",        short: "NOTAS",    icon: StickyNote    },
  { id: "tarefas",     label: "Tarefas",      short: "TAREFAS",  icon: ListTodo      },
  { id: "historico",   label: "Histórico",    short: "HIST.",    icon: Clock         },
  { id: "mensagens",   label: "Chat",         short: "CHAT",     icon: MessageCircle },
  { id: "relatorio",   label: "Relatório IA", short: "IA",       icon: Zap           },
  { id: "produtos",    label: "Produtos",     short: "PROD.",    icon: Package       },
  { id: "logs",        label: "Logs",         short: "LOGS",     icon: ScrollText    },
] as const;

export const LeadDetailsTempCfg = {
  Quente: {
    stripe: "from-rose-500 via-orange-400 to-rose-500/0",
    hero: "from-rose-900/40 via-rose-800/10 to-transparent",
    avatar: "bg-rose-500/25 text-rose-200 ring-rose-500/50",
    badge: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    icon: Flame,
    iconCls: "text-rose-400",
    label: "Quente",
    dot: "bg-rose-400",
  },
  Morno: {
    stripe: "from-amber-400 via-yellow-300 to-amber-400/0",
    hero: "from-amber-900/40 via-amber-800/10 to-transparent",
    avatar: "bg-amber-500/25 text-amber-200 ring-amber-500/50",
    badge: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    icon: Sun,
    iconCls: "text-amber-400",
    label: "Morno",
    dot: "bg-amber-400",
  },
  Frio: {
    stripe: "from-blue-500 via-cyan-400 to-blue-500/0",
    hero: "from-blue-900/40 via-blue-800/10 to-transparent",
    avatar: "bg-blue-500/25 text-blue-200 ring-blue-500/50",
    badge: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    icon: Sun,
    iconCls: "text-blue-400",
    label: "Frio",
    dot: "bg-blue-400",
  },
} as const;
