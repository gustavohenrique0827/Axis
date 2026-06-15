import { useState } from "react";
import { X, GitFork, ExternalLink, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (username: string) => void;
}

export function ConectarGitHubModal({ isOpen, onClose, onConnected }: Props) {
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    const token = pat.trim();
    if (!token) { setError("Cole o token primeiro."); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
      });
      if (!res.ok) { setError("Token inválido ou sem permissão. Verifique e tente novamente."); return; }
      const user = await res.json();

      if (supabase) {
        await supabase.from("app_settings").upsert(
          { key: "github_config", value: { pat: token, username: user.login, avatar: user.avatar_url, connected_at: new Date().toISOString() } },
          { onConflict: "key" }
        );
      }

      toast.success(`GitHub conectado como @${user.login}`);
      onConnected(user.login);
      onClose();
    } catch {
      setError("Erro de rede ao validar o token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <GitFork className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Conectar GitHub</h2>
              <p className="text-[10px] text-slate-500 font-bold">Personal Access Token</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Steps */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 space-y-2.5">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Como criar o token</p>
            <ol className="space-y-1.5">
              {[
                "Acesse github.com → Settings → Developer Settings",
                'Clique em "Personal access tokens" → "Tokens (classic)"',
                'Clique em "Generate new token (classic)"',
                "Marque o escopo: repo (ou contents para somente leitura)",
                "Copie e cole o token abaixo",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <a
              href="https://github.com/settings/tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors mt-1"
            >
              <ExternalLink className="w-3 h-3" /> Abrir GitHub tokens
            </a>
          </div>

          {/* Token input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Token</label>
            <div className="relative">
              <input
                type={showPat ? "text" : "password"}
                value={pat}
                onChange={e => { setPat(e.target.value); setError(null); }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#111827] border border-white/8 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPat(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2 text-[10px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 shrink-0 mt-0.5" />
            Token salvo no banco de dados (não no navegador). Acesso restrito ao seu tenant.
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-[11px] text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="h-9 px-5 text-[10px] font-black uppercase tracking-widest border-white/8">
            Cancelar
          </Button>
          <Button
            onClick={handleConnect}
            disabled={loading || !pat.trim()}
            className="h-9 px-5 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-slate-200 gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitFork className="w-3.5 h-3.5" />}
            {loading ? "Validando..." : "Conectar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
