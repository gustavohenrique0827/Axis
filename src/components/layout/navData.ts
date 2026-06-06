import {
  LayoutDashboard,
  Users,
  Columns3,
  CheckSquare,
  Settings,
  Mail,
  Zap,
  Target,
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
      { name: "Performance SDR/IA", path: "/app/performance-ia", icon: Brain, reqModule: "bi" },
      { name: "CPM / Indicadores", path: "/app/indicadores", icon: BarChart2, reqModule: "bi" },
      { name: "Relatórios", path: "/app/relatorios", icon: PieChart, reqModule: "bi" },
    ],
  },
  {
    title: "CRM & Operações",
    items: [
      { name: "Leads", path: "/app/leads", icon: Target },
      { name: "Pipeline", path: "/app/pipeline", icon: Columns3 },
      { name: "Propostas", path: "/app/propostas", icon: FileText },
      { name: "Clientes", path: "/app/clientes", icon: Users },
      { name: "Produtos", path: "/app/produtos", icon: FolderOpen },
    ],
  },
  {
    title: "Gestão Clínica",
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
    items: [
      { name: "Mensageria", path: "/app/mensageria", icon: Mail },
      { name: "Automações", path: "/app/automacoes", icon: Zap },
    ],
  },
  {
    title: "Conteúdo & Social",
    items: [
      { name: "Conteúdo", path: "/app/marketing/conteudo", icon: Edit3 },
      { name: "Social Media", path: "/app/marketing/social", icon: Share2 },
      { name: "Landing Pages", path: "/app/marketing/landing-pages", icon: Globe },
    ],
  },
  {
    title: "Campanhas & Analytics",
    items: [
      { name: "Campanhas", path: "/app/marketing/campanhas", icon: Megaphone },
      { name: "Métricas", path: "/app/marketing/analytics", icon: BarChart2 },
    ],
  },
  {
    title: "Educação",
    items: [
      { name: "Painel Educação", path: "/app/educacao/painel", icon: LayoutDashboard },
      { name: "Turmas Ativas", path: "/app/educacao/turmas", icon: GraduationCap },
      { name: "Base de Alunos", path: "/app/educacao/alunos", icon: Users },
      { name: "Banco de Conteúdo", path: "/app/educacao/conteudo", icon: BookOpen },
      { name: "Certificados", path: "/app/educacao/certificados", icon: Award },
    ],
  },
  {
    title: "Financeiro & Produtividade",
    items: [
      { name: "Painel Financeiro", path: "/app/financeiro", icon: Wallet },
      { name: "Tarefas", path: "/app/tarefas", icon: CheckSquare },
    ],
  },
  {
    title: "Dev & Tecnologia",
    items: [
      { name: "Painel Dev", path: "/app/dev/painel", icon: Code2, reqModule: "dev" },
      { name: "Projetos", path: "/app/dev/projetos", icon: FolderCode, reqModule: "dev" },
      { name: "Sprints", path: "/app/dev/sprints", icon: Kanban, reqModule: "dev" },
      { name: "Issues & Bugs", path: "/app/dev/issues", icon: Bug, reqModule: "dev" },
      { name: "Repositórios", path: "/app/dev/repositorios", icon: GitBranch, reqModule: "dev" },
      { name: "Ambientes", path: "/app/dev/ambientes", icon: MonitorCheck, reqModule: "dev" },
    ],
  },
  {
    title: "Gestão do Sistema",
    items: [
      { name: "Colaboradores", path: "/app/equipe", icon: Users },
      { name: "Integrações SDR", action: "sdr-webhooks", icon: Zap },
      { name: "Configurações", path: "/app/configuracoes", icon: Settings },
    ],
  },
];
