import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Extensões de navegador (gerenciadores de senha, principalmente) injetam
// nós no DOM assim que campos de e-mail/senha aparecem, fora do controle do
// React. Quando o React tenta reconciliar em volta desses nós estranhos,
// dispara um NotFoundError benigno e transitório — a remontagem seguinte se
// recupera sozinha. Tratar isso como uma tela de erro real é pior do que
// simplesmente tentar de novo automaticamente.
const BENIGN_DOM_RACE = /insertBefore|removeChild/;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  private autoRetryCount = 0;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const isBenignDomRace = error.name === "NotFoundError" && BENIGN_DOM_RACE.test(error.message);

    if (isBenignDomRace && this.autoRetryCount < 2) {
      this.autoRetryCount += 1;
      console.warn("[Axis] DOM alterado por extensão do navegador — remontando automaticamente:", error.message);
      this.setState({ error: null });
      return;
    }

    console.error("[Axis] Erro de renderização capturado:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.autoRetryCount = 0;
      if (this.state.error) this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Não foi possível carregar esta página</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-md">
              Ocorreu um erro inesperado ao renderizar este módulo. Você pode tentar novamente ou navegar para outra seção.
            </p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
