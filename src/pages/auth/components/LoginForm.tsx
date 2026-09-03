import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { signIn, requestPasswordReset } from "../../../lib/supabase";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/app/dashboard";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setSendingReset(true);
    await requestPasswordReset(resetEmail);
    setSendingReset(false);
    // Mensagem sempre igual, exista ou não a conta — evita enumeração de e-mails.
    toast.success("Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha.");
    setShowForgotPassword(false);
    setResetEmail("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) { setError(result.error || "Falha no login"); return; }
      login(result.user);
      toast.success(`Bem-vindo, ${result.user.name}!`);
      navigate(from, { replace: true });
    } catch {
      setError("Erro ao processar autenticação.");
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <Card className="p-8 bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] shadow-sm">
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold">Redefinir senha</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                placeholder="admin@g-tech.com"
              />
            </div>
          </div>
          <Button type="submit" disabled={sendingReset || !resetEmail} className="w-full py-6 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg text-md font-semibold group">
            {sendingReset ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
          <button type="button" onClick={() => setShowForgotPassword(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] block mx-auto cursor-pointer">
            Voltar para o login
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] shadow-sm">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--color-text-muted)]">E-mail Corporativo</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-faint)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
              placeholder="admin@g-tech.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Senha</label>
            <button type="button" onClick={() => { setShowForgotPassword(true); setResetEmail(email); }} className="text-xs text-[#2563EB] hover:text-blue-500 cursor-pointer">Esqueci a senha</button>
          </div>
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

        {error && <div className="text-sm text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">{error}</div>}

        <Button type="submit" disabled={loading} className="w-full py-6 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg text-md font-semibold group">
          {loading ? "Entrando..." : "Entrar"} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Card>
  );
}
