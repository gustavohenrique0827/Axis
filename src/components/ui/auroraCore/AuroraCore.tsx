import { lazy, Suspense } from "react";
import { Box, Layers } from "lucide-react";
import { AuroraCore2D } from "./AuroraCore2D";
import type { AuroraCoreMode } from "./auroraCoreStates";
import { useAuth } from "../../../contexts/AuthContext";

// Three.js + @react-three/fiber só entram no bundle quando alguém de fato troca pro núcleo 3D —
// sem isso, o Three.js (~1MB+) carregava no chunk principal do Axis pra TODA página, mesmo pra
// quem nunca abre a Aurora ou nunca troca de variante. Confirmado com `npm run build`: o chunk
// principal foi de bem menos que 500kB pra 4.36MB antes deste lazy() entrar.
const AuroraCore3D = lazy(() => import("./AuroraCore3D").then((m) => ({ default: m.AuroraCore3D })));

type CoreVariant = "2d" | "3d";

interface AuroraCoreProps {
  mode: AuroraCoreMode;
  size: number;
  /** Mostra o botãozinho de alternar 2D/3D sobreposto no canto do núcleo — usar só numa
   * instância por tela (ex: a do cabeçalho do painel aberto), não na bolinha flutuante. */
  showToggle?: boolean;
}

/**
 * Núcleo visual da Aurora — alterna entre a versão 2D (Canvas leve, sem dependências) e a versão
 * 3D (Three.js, porta real do núcleo do jarvis-os). A preferência é do usuário, gravada em
 * public.users.preferences — cada instância do núcleo na tela reflete a mesma escolha porque
 * todas leem do mesmo UserSession no AuthContext.
 */
export function AuroraCore({ mode, size, showToggle = false }: AuroraCoreProps) {
  const { user, updatePreferences } = useAuth();
  const variant: CoreVariant = user?.preferences?.auroraCoreVariant === "3d" ? "3d" : "2d";

  const toggle = () => {
    const next: CoreVariant = variant === "2d" ? "3d" : "2d";
    updatePreferences({ auroraCoreVariant: next });
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {variant === "2d" ? (
        <AuroraCore2D mode={mode} size={size} />
      ) : (
        <Suspense fallback={<AuroraCore2D mode={mode} size={size} />}>
          <AuroraCore3D mode={mode} size={size} />
        </Suspense>
      )}

      {showToggle && (
        <button
          onClick={toggle}
          title={variant === "2d" ? "Alternar para núcleo 3D" : "Alternar para núcleo 2D"}
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-surface-elevated)] border border-white/[0.12] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/[0.25] transition-all"
        >
          {variant === "2d" ? <Layers className="w-2.5 h-2.5" /> : <Box className="w-2.5 h-2.5" />}
        </button>
      )}
    </div>
  );
}
