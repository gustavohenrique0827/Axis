import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { updatePassword } from "../../lib/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const logoDarkFull = "/logo-full.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    // O link do e-mail de recuperação já autentica temporariamente a sessão via
    // Supabase Auth — updatePassword() só troca a senha dessa sessão já ativa.
    const result = await updatePassword(password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo.");
      return;
    }
    toast.success("Senha redefinida com sucesso! Faça login com a nova senha.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)] font-sans flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-xl p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block bg-[#0B1120] rounded-2xl overflow-hidden p-4 shadow-lg shadow-blue-500/10 mb-6">
            <img
              src={logoDarkFull}
              alt="Axis CRM Logo"
              title="Axis CRM"
              className="logo-container mx-auto h-auto w-64 max-w-full mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">Redefinir senha</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Escolha uma nova senha para sua conta.</p>
        </div>

        <Card className="p-8 bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Confirmar nova senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="text-sm text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full py-6 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg text-md font-semibold group">
              {loading ? "Salvando..." : "Redefinir senha"} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
