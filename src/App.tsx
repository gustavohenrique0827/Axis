import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { requestNotificationPermission } from "./lib/notifications";
import LandingPage from "./pages/landing/LandingPage";
// Lazy: página de marketing pública, sem nenhuma dependência do app autenticado — fica no
// próprio chunk pra quem visita /lp não baixar o bundle inteiro do CRM.
const AxisLandingPage = lazy(() => import("./pages/lp/AxisLandingPage"));
import Dashboard from "./pages/dashboard/Dashboard";
import PerformanceIA from "./pages/dashboard/PerformanceIA";
import PainelGeral from "./pages/clinica/PainelGeral";
import AgendaMedica from "./pages/clinica/AgendaMedica";
import Prontuarios from "./pages/clinica/Prontuarios";
import Faturamento from "./pages/clinica/Faturamento";
import Estoque from "./pages/clinica/Estoque";
import Telemedicina from "./pages/clinica/Telemedicina";
import Exames from "./pages/clinica/Exames";
import EstatisticasClinicas from "./pages/clinica/Estatisticas";
import Pacientes from "./pages/clinica/Pacientes";
import Login from "./pages/auth/Login";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Pipeline from "./pages/crm/Pipeline";
import Clientes from "./pages/crm/Clientes";
import AgendaCRM from "./pages/crm/AgendaCRM";
import Tarefas from "./pages/operative/Tarefas";
import Produtos from "./pages/operative/Produtos";
import Indicadores from "./pages/operative/Indicadores";
import Equipe from "./pages/operative/Equipe";

import Contracts from "./pages/crm/Contracts";
import Messaging from "./pages/crm/Messaging";
import Automations from "./pages/marketing/Automations";
import AdminSaaS from "./pages/admin/AdminSaaS";
import PartnersOverview from "./pages/partners/PartnersOverview";

import FinanceiroLayout from "./pages/finance/FinanceiroLayout";
import FinanceiroVisaoGeral from "./pages/finance/FinanceiroVisaoGeral";
import FinanceiroReceber from "./pages/finance/FinanceiroReceber";
import FinanceiroPagar from "./pages/finance/FinanceiroPagar";
import FinanceiroComissoes from "./pages/finance/FinanceiroComissoes";
import FinanceiroDRE from "./pages/finance/FinanceiroDRE";
import FinanceiroMetas from "./pages/finance/FinanceiroMetas";
import FinanceiroConfiguracoes from "./pages/finance/FinanceiroConfiguracoes";

import SettingsLayout from "./pages/settings/SettingsLayout";
import ConfigEmpresaDados from "./pages/settings/ConfigEmpresaDados";
import ConfigModulosDemos from "./pages/settings/ConfigModulosDemos";
import {
  ConfigEmpresaFiliais,
  ConfigEmpresaEquipe,
  ConfigEmpresaPermissoes,
  ConfigEmpresaCargos,
  ConfigCRMFunis,
  ConfigCRMOrigens,
  ConfigCRMProdutos,
  ConfigProdutividadeCategorias,
  ConfigFinanceiroCategorias,
  ConfigEngajamentoModelos,
  ConfigEngajamentoAutomacoes,
  ConfigIntegracoesApps,
  ConfigNotificacoesPreferencias,
  ConfigPerfilUsuario,
  ConfigPreferenciasSistema,
  ConfigCRMCampos,
  ConfigCRMSLA,
  ConfigCRMGatilhosIA,
  ConfigIntegracoesSMTP,
  ConfigSistemaBackups,
  ConfigIntegracoesSDR,
  ConfigFinanceiroSquads,
  ConfigRodizioLeads,
  ConfigKanbanBoards
} from "./pages/settings/SettingsPages";
import { ConfigIntegracoesWebhooks } from "./pages/settings/ConfigIntegracoesWebhooks";
import SettingsGenericForm from "./pages/settings/SettingsGenericForm";
import GenericPlaceholder from "./pages/common/GenericPlaceholder";
import EducationTurmas from "./pages/education/Turmas";
import EducationConteudo from "./pages/education/Conteudo";
import EducationCertificados from "./pages/education/Certificados";
import AlunosEdu from "./pages/education/Alunos";
import PainelGeralEdu from "./pages/education/PainelGeral";
import Propostas from "./pages/crm/Propostas";
import CommercialDashboard from "./pages/crm/Dashboard";
import MarketingAutomacoes from "./pages/marketing/MarketingAutomacoes";
import MarketingConteudo from "./pages/marketing/MarketingConteudo";
import MarketingCampanhas from "./pages/marketing/MarketingCampanhas";
import MarketingAnalytics from "./pages/marketing/MarketingAnalytics";
import MarketingSocial from "./pages/marketing/MarketingSocial";
import MarketingLandingPages from "./pages/marketing/MarketingLandingPages";
import EEmpreendaEditor from "./pages/marketing/EEmpreendaEditor";
import MarketingFormularios from "./pages/marketing/MarketingFormularios";
import RHColaboradores from "./pages/hr/RHColaboradores";
import ReunioesList from "./pages/reunioes/index";
import ReuniaoRoom from "./pages/reunioes/ReuniaoRoom";
import ImobiliarioPainel from "./pages/imobiliario/PainelGeral";
import ImobiliariosImoveis from "./pages/imobiliario/Imoveis";
import ImobiliariosCorretores from "./pages/imobiliario/Corretores";
import ImobiliariosLeads from "./pages/imobiliario/Leads";
import ImobiliariosVisitas from "./pages/imobiliario/Visitas";
import ImobiliariosPipeline from "./pages/imobiliario/Pipeline";
import PortfolioCorretor from "./pages/imobiliario/PortfolioCorretor";
import PainelDev from "./pages/dev/PainelDev";
import ProjetosDev from "./pages/dev/Projetos";
import SprintsDev from "./pages/dev/Sprints";
import IssuesDev from "./pages/dev/Issues";
import RepositoriosDev from "./pages/dev/Repositorios";
import AmbientesDev from "./pages/dev/Ambientes";
import ProjetoDetalhesDev from "./pages/dev/ProjetoDetalhesDev";

import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { Toaster } from "sonner";
import { InteractiveForm } from "./pages/common/InteractiveForm";
import { ConfirmDialogHost } from "./components/ui/confirm-dialog";

function AppContent() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/login');
  const { theme } = useData();

  useEffect(() => {
    if (isAppRoute) {
      requestNotificationPermission();
    }
  }, [isAppRoute]);

  return (
    <>
      {isAppRoute && <Toaster theme={theme} position="bottom-right" richColors closeButton />}
      {isAppRoute && <ConfirmDialogHost />}
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route
          path="/lp"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#050609]" />}>
              <AxisLandingPage />
            </Suspense>
          }
        />
        <Route path="/login" element={<Login />} />
        {/* Auto-cadastro público desativado: Axis não é mais um SaaS de self-signup —
            novos tenants passam a ser criados por quem já está autenticado (G-Tech/parceiros).
            Rota removida em vez de deixá-la quebrar silenciosamente contra o RLS da Fase 1. */}
        <Route path="/register" element={<Navigate to="/login" replace />} />

        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Navigate to="/app/pipeline" replace />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="crm/agenda" element={<AgendaCRM />} />
          <Route path="agenda" element={<Navigate to="/app/crm/agenda" replace />} />
          <Route path="performance-ia" element={<PerformanceIA />} />
          <Route path="clinica">
            <Route index element={<Navigate to="painel" replace />} />
            <Route path="painel" element={<PainelGeral />} />
            <Route path="agenda" element={<AgendaMedica />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="prontuarios" element={<Prontuarios />} />
            <Route path="faturamento" element={<Faturamento />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="telemedicina" element={<Telemedicina />} />
            <Route path="exames" element={<Exames />} />
            <Route path="bi" element={<EstatisticasClinicas />} />
          </Route>
          <Route path="clientes" element={<Clientes />} />

          <Route path="propostas" element={<Propostas />} />

          <Route path="tarefas" element={<Tarefas />} />
          <Route path="produtos" element={<Produtos />} />

          <Route path="educacao">
            <Route index element={<Navigate to="painel" replace />} />
            <Route path="painel" element={<PainelGeralEdu />} />
            <Route path="turmas" element={<EducationTurmas />} />
            <Route path="alunos" element={<AlunosEdu />} />
            <Route path="conteudo" element={<EducationConteudo />} />
            <Route path="certificados" element={<EducationCertificados />} />
          </Route>

          <Route path="marketing">
            <Route index element={<Navigate to="conteudo" replace />} />
            <Route path="conteudo" element={<MarketingConteudo />} />
            <Route path="campanhas" element={<MarketingCampanhas />} />
            <Route path="analytics" element={<MarketingAnalytics />} />
            <Route path="social" element={<MarketingSocial />} />
            <Route path="landing-pages" element={<MarketingLandingPages />} />
            <Route path="landing-pages/eempreenda" element={<EEmpreendaEditor />} />
            <Route path="formularios" element={<MarketingFormularios />} />
          </Route>

          <Route path="mensageria" element={<Messaging />} />
          <Route path="automacoes" element={<MarketingAutomacoes />} />

          <Route path="indicadores" element={<Indicadores />} />
          <Route path="relatorios" element={<Indicadores />} /> {/* Reutlizando Indicadores */}
          <Route path="equipe" element={<RHColaboradores />} />

          {/* Financeiro Layout & Nested Routes */}
          <Route path="financeiro" element={<FinanceiroLayout />}>
            <Route index element={<FinanceiroVisaoGeral />} />
            <Route path="faturas" element={<Contracts />} /> {/* Resuing contracts view for demo */}
            <Route path="receber" element={<FinanceiroReceber />} />
            <Route path="pagar" element={<FinanceiroPagar />} />
            <Route path="comissoes" element={<FinanceiroComissoes />} />
            <Route path="dre" element={<FinanceiroDRE />} />
            <Route path="metas" element={<FinanceiroMetas />} />
            <Route path="categorias" element={<SettingsGenericForm />} />
            <Route path="configuracoes" element={<FinanceiroConfiguracoes />} />
            <Route path="configuracoes/:section" element={<FinanceiroConfiguracoes />} />
            <Route path="*" element={<GenericPlaceholder />} />
          </Route>

          {/* Configurações Layout & Nested Routes */}
          <Route path="configuracoes" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/app/configuracoes/usuario/perfil" />} />
            <Route path="usuario/perfil" element={<ConfigPerfilUsuario />} />
            <Route path="usuario/preferencias" element={<ConfigPreferenciasSistema />} />
            <Route path="usuario/notificacoes" element={<ConfigNotificacoesPreferencias />} />
            <Route path="empresa/dados" element={<ConfigEmpresaDados />} />
            <Route path="empresa/modulos" element={<ConfigModulosDemos />} />
            <Route path="empresa/filiais" element={<ConfigEmpresaFiliais />} />
            <Route path="empresa/equipe" element={<ConfigEmpresaEquipe />} />
            <Route path="empresa/permissoes" element={<ConfigEmpresaPermissoes />} />
            <Route path="empresa/cargos" element={<ConfigEmpresaCargos />} />

            <Route path="crm/funis" element={<ConfigCRMFunis />} />
            <Route path="crm/origens" element={<ConfigCRMOrigens />} />
            <Route path="crm/produtos" element={<ConfigCRMProdutos />} />
            <Route path="crm/campos" element={<ConfigCRMCampos />} />
            <Route path="crm/sla" element={<ConfigCRMSLA />} />
            <Route path="crm/gatilhos-ia" element={<ConfigCRMGatilhosIA />} />
            <Route path="crm/rodizio" element={<ConfigRodizioLeads />} />

            <Route path="produtividade/categorias" element={<ConfigProdutividadeCategorias />} />
            <Route path="kanbans" element={<ConfigKanbanBoards />} />

            <Route path="financeiro/categorias" element={<ConfigFinanceiroCategorias />} />
            <Route path="financeiro/squads" element={<ConfigFinanceiroSquads />} />

            <Route path="engajamento/modelos" element={<ConfigEngajamentoModelos />} />
            <Route path="engajamento/automacoes" element={<ConfigEngajamentoAutomacoes />} />

            <Route path="integracoes/apps" element={<ConfigIntegracoesApps />} />
            <Route path="integracoes/smtp" element={<ConfigIntegracoesSMTP />} />
            <Route path="integracoes/webhooks" element={<ConfigIntegracoesWebhooks />} />
            <Route path="integracoes/sdr-webhooks" element={<ConfigIntegracoesSDR />} />

            <Route path="sistema/backups" element={<ConfigSistemaBackups />} />

            <Route path="*" element={<SettingsGenericForm />} />
          </Route>

          {/* Dev & Tecnologia */}
          <Route path="dev">
            <Route index element={<Navigate to="painel" replace />} />
            <Route path="painel" element={<PainelDev />} />
            <Route path="projetos" element={<ProjetosDev />} />
            <Route path="sprints" element={<SprintsDev />} />
            <Route path="issues" element={<IssuesDev />} />
            <Route path="repositorios" element={<RepositoriosDev />} />
            <Route path="ambientes" element={<AmbientesDev />} />
            <Route path="projetos/:projectId" element={<ProjetoDetalhesDev />} />

          </Route>

          {/* Módulo Imobiliário */}
          <Route path="imobiliario">
            <Route index element={<Navigate to="painel" replace />} />
            <Route path="painel" element={<ImobiliarioPainel />} />
            <Route path="pipeline" element={<ImobiliariosPipeline />} />
            <Route path="imoveis" element={<ImobiliariosImoveis />} />
            <Route path="corretores" element={<ImobiliariosCorretores />} />
            <Route path="leads" element={<Navigate to="/app/imobiliario/pipeline" replace />} />
            <Route path="visitas" element={<ImobiliariosVisitas />} />
          </Route>

          <Route path="reunioes">
            <Route index element={<ReunioesList />} />
            <Route path=":id" element={<ReuniaoRoom />} />
          </Route>

          <Route path="admin" element={<AdminSaaS />} />
          <Route path="parceiros" element={<PartnersOverview />} />
        </Route>

        {/* Portfólio público do corretor — sem autenticação */}
        <Route path="/corretor/:slug" element={<PortfolioCorretor />} />

        {/* Marketing/Capture Forms Hub */}
        <Route path="/f/:niche" element={<InteractiveForm />} />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
