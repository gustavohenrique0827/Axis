import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { signIn, requestPasswordReset } from "../../../lib/supabase";
import { toast } from "sonner";

const inputClass = `
  w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-all duration-200 outline-none
  placeholder:text-[#334155]
  focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60
`.trim();

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#E2E8F0",
};

const inputFocusStyle = {
  background: "rgba(37,99,235,0.08)",
  borderColor: "rgba(37,99,235,0.5)",
};

function FieldInput({
  id,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightSlot,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <Icon
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: focused ? "#60A5FA" : "#475569", transition: "color 0.2s" }}
      />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === "password" ? "current-password" : "email"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={inputClass}
        style={focused ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
      />
      {rightSlot}
    </div>
  );
}

export function LoginForm() {
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [showForgotPassword, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail]         = useState("");
  const [sendingReset, setSendingReset]     = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const from      = location.state?.from?.pathname || "/app/dashboard";

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setSendingReset(true);
    await requestPasswordReset(resetEmail);
    setSendingReset(false);
    toast.success("Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha.");
    setShowForgot(false);
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

  /* ── Tela de recuperação de senha ── */
  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.3)" }}
          >
            <KeyRound className="w-4 h-4" style={{ color: "#60A5FA" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#F8FAFC" }}>Redefinir senha</h3>
            <p className="text-[11px]" style={{ color: "#64748B" }}>
              Enviaremos um link para seu e-mail.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reset-email" className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
            E-mail Corporativo
          </label>
          <FieldInput
            id="reset-email"
            type="email"
            value={resetEmail}
            onChange={setResetEmail}
            placeholder="admin@empresa.com"
            icon={Mail}
          />
        </div>

        <button
          type="submit"
          disabled={sendingReset || !resetEmail}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
          }}
        >
          {sendingReset ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            "Enviar link de redefinição"
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowForgot(false)}
          className="w-full text-xs text-center transition-colors duration-200 py-1"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
        >
          ← Voltar para o login
        </button>
      </form>
    );
  }

  /* ── Formulário principal ── */
  return (
    <form onSubmit={handleLogin} className="space-y-5">

      {/* E-mail */}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
          E-mail Corporativo
        </label>
        <FieldInput
          id="login-email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="admin@empresa.com"
          icon={Mail}
        />
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="login-password" className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
            Senha
          </label>
          <button
            type="button"
            onClick={() => { setShowForgot(true); setResetEmail(email); }}
            className="text-xs transition-colors duration-200"
            style={{ color: "#2563EB" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
          >
            Esqueci a senha
          </button>
        </div>
        <FieldInput
          id="login-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={Lock}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors duration-200"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div
          className="text-xs rounded-xl px-4 py-3 flex items-start gap-2"
          style={{
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.2)",
            color: "#FB7185",
          }}
        >
          <span className="mt-0.5 flex-shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Botão de login */}
      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 group disabled:opacity-60"
        style={{
          background: loading
            ? "rgba(37,99,235,0.5)"
            : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          color: "#fff",
          boxShadow: loading ? "none" : "0 4px 24px rgba(37,99,235,0.45)",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.boxShadow = "0 6px 32px rgba(37,99,235,0.6)";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.45)";
        }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
        ) : (
          <>
            Entrar
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
