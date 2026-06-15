import {
  LayoutDashboard,
  Users,
  Columns3,
  CheckSquare,
  Settings,
  Mail,
  Zap,
  BarChart2,
  PieChart,
  Brain,
  Wallet,
  FolderOpen,
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Megaphone,
  Edit3,
  Share2,
  Globe,
  Stethoscope,
  Calendar,
  Video,
  Archive,
  FlaskConical,
  BarChart3,
  Code2,
  FolderCode,
  Kanban,
  Bug,
  GitBranch,
  MonitorCheck,
} from "lucide-react";

export const navSections = [
  {
    title: "Geral",
    items: [
      { name: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CRM & Pipeline",
    reqModule: "crm",
    items: [
      { name: "Leads & Pipeline", path: "/app/pipeline", icon: Columns3 },
      { name: "Reuniões", path: "/app/reunioes", icon: Video },
      { name: "Propostas", path: "/app/propostas", icon: FileText },
      { name: "Clientes", path: "/app/clientes", icon: Users },
    ],
  },
  {
    title: "Catálogo",
    reqModule: "catalogo",
    items: [
      { name: "Produtos", path: "/app/produtos", icon: FolderOpen },
    ],
  },
  {
    title: "Clínica & Saúde",
    reqModule: "clinica",
    items: [
      { name: "Painel Geral", path: "/app/clinica/painel", icon: Stethoscope },
      { name: "Agenda Médica", path: "/app/clinica/agenda", icon: Calendar },
      { name: "Pacientes", path: "/app/clinica/pacientes", icon: Users },
      { name: "Prontuários EHR", path: "/app/clinica/prontuarios", icon: FileText },
      { name: "Faturamento", path: "/app/clinica/faturamento", icon: Wallet },
      { name: "Estoque", path: "/app/clinica/estoque", icon: Archive },
      { name: "Telemedicina", path: "/app/clinica/telemedicina", icon: Video },
      { name: "Exames & Labs", path: "/app/clinica/exames", icon: FlaskConical },
      { name: "BI Clínico", path: "/app/clinica/bi", icon: BarChart3 },
    ],
  },
  {
    title: "Engajamento",
    reqModule: "engajamento",
    items: [
      { name: "Mensageria", path: "/app/mensageria", icon: Mail },
      { name: "Automações", path: "/app/automacoes", icon: Zap },
    ],
  },
  {
    title: "Marketing",
    reqModule: "marketing",
    items: [
      { name: "Conteúdo", path: "/app/marketing/conteudo", icon: Edit3 },
      { name: "Social Media", path: "/app/marketing/social", icon: Share2 },
      { name: "Landing Pages", path: "/app/marketing/landing-pages", icon: Globe },
      { name: "Formulários", path: "/app/marketing/formularios", icon: FileText },
      { name: "Campanhas", path: "/app/marketing/campanhas", icon: Megaphone },
      { name: "Métricas", path: "/app/marketing/analytics", icon: BarChart2 },
    ],
  },
  {
    title: "Educação",
    reqModule: "educacao",
    items: [
      { name: "Painel Educação", path: "/app/educacao/painel", icon: LayoutDashboard },
      { name: "Turmas Ativas", path: "/app/educacao/turmas", icon: GraduationCap },
      { name: "Base de Alunos", path: "/app/educacao/alunos", icon: Users },
      { name: "Banco de Conteúdo", path: "/app/educacao/conteudo", icon: BookOpen },
      { name: "Certificados", path: "/app/educacao/certificados", icon: Award },
    ],
  },
  {
    title: "Financeiro",
    reqModule: "financeiro",
    items: [
      { name: "Painel Financeiro", path: "/app/financeiro", icon: Wallet },
    ],
  },
  {
    title: "Produtividade",
    reqModule: "produtividade",
    items: [
      { name: "Tarefas", path: "/app/tarefas", icon: CheckSquare },
    ],
  },
  {
    title: "BI & Indicadores",
    reqModule: "bi",
    items: [
      { name: "Performance SDR/IA", path: "/app/performance-ia", icon: Brain },
      { name: "CPM / Indicadores", path: "/app/indicadores", icon: BarChart2 },
      { name: "Relatórios", path: "/app/relatorios", icon: PieChart },
    ],
  },
  {
    title: "Dev & Tecnologia",
    reqModule: "dev",
    items: [
      { name: "Painel Dev", path: "/app/dev/painel", icon: Code2 },
      { name: "Projetos", path: "/app/dev/projetos", icon: FolderCode },
      { name: "Sprints", path: "/app/dev/sprints", icon: Kanban },
      { name: "Issues & Bugs", path: "/app/dev/issues", icon: Bug },
      { name: "Repositórios", path: "/app/dev/repositorios", icon: GitBranch },
      { name: "Ambientes", path: "/app/dev/ambientes", icon: MonitorCheck },
    ],
  },
  {
    title: "RH & Colaboradores",
    reqModule: "rh",
    items: [
      { name: "Colaboradores", path: "/app/equipe", icon: Users },
    ],
  },
  {
    title: "Sistema",
    items: [
      { name: "Integrações SDR", action: "sdr-webhooks", icon: Zap },
      { name: "Configurações", path: "/app/configuracoes", icon: Settings },
    ],
  },
];
