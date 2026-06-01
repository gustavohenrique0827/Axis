import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Lock, Mail, ArrowRight, Building, Fingerprint, Phone, UserCheck } from "lucide-react";
import { useAuth, TenantNiche, UserSession } from "../../contexts/AuthContext";
import { registerPartner, signIn } from "../../lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [niche, setNiche] = useState<TenantNiche>("Parceira");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/app/dashboard";

  const [logoDarkFull, setLogoDarkFull] = useState(() => localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");

  useEffect(() => {
    const handleBrandChange = () => {
      setLogoDarkFull(localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
    };
    window.addEventListener("axis_brand_changed", handleBrandChange);
    return () => window.removeEventListener("axis_brand_changed", handleBrandChange);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Falha no login");
        setLoading(false);
        return;
      }

      login(result.user);
      toast.success(`Bem-vindo, ${result.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError("Erro ao processar autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!companyName || !email || !password || !confirmPassword || !phone) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);
    try {
      // Register in Supabase
      const result = await registerPartner(companyName, email, password, phone, niche);

      if (!result.success) {
        setError(result.error || "Erro ao registrar empresa");
        toast.error(result.error || "Erro ao registrar empresa");
        setLoading(false);
        return;
      }

      // If Supabase registration succeeds, create local session
      login({
        name: `Admin ${companyName}`,
        email,
        role: "Admin",
        tenantName: companyName,
        tenantNiche: niche,
        isMaster: false
      });

      toast.success(`Bem-vindo, ${companyName}! Empresa registrada com sucesso.`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido no registro");
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (tenantName: string, niche: TenantNiche, isMaster: boolean) => {
    login({
      name: `Admin ${niche}`,
      email: `admin@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
      role: isMaster ? "Super Admin" : "Gerente",
      tenantName,
      tenantNiche: niche,
      isMaster
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#2563EB]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#06B6D4]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-4xl p-6 relative z-10 flex flex-col md:flex-row gap-8 items-start">

        {/* Left Side: Login / Registration */}
        <div className="flex-1 w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="relative inline-block bg-[#0B1120] rounded-2xl overflow-hidden p-3 border border-white/5 mb-6">
              <img
                src={logoDarkFull}
                alt="Axis CRM Logo"
                title="Axis CRM"
                className="logo-container mx-auto h-auto w-64 max-w-full mix-blend-screen"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo ao Axis CRM</h1>
            <p className="text-slate-400 text-sm">Acesse a plataforma ou cadastre sua empresa parceira.</p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-full ${mode === "login" ? "bg-[#2563EB] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`px-4 py-2 rounded-full ${mode === "register" ? "bg-[#2563EB] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
            >
              Registrar
            </button>
          </div>

          <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      placeholder="admin@g-tech.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Senha</label>
                    <a href="#" className="text-xs text-[#2563EB] hover:text-blue-400">Esqueci a senha</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full py-6 bg-[#2563EB] hover:bg-blue-600 rounded-lg text-md font-bold shadow-lg shadow-blue-500/20 group">
                  Entrar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-400 font-semibold">Nome da Empresa</span>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        placeholder="Ex: Axis Parceira"
                      />
                    </div>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-400 font-semibold">Telefone</span>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </div>
                  </label>
                </div>

                <label className="space-y-2 text-sm">
                  <span className="text-slate-400 font-semibold">E-mail Corporativo</span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-400 font-semibold">Senha</span>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        placeholder="••••••••"
                      />
                    </div>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-slate-400 font-semibold">Confirmar senha</span>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        placeholder="••••••••"
                      />
                    </div>
                  </label>
                </div>

                <label className="space-y-2 text-sm">
                  <span className="text-slate-400 font-semibold">Segmento</span>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value as TenantNiche)}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="Parceira">Parceira</option>
                    <option value="Solar">Solar</option>
                    <option value="Imobiliária">Imobiliária</option>
                    <option value="Clínica">Clínica</option>
                    <option value="Tecnologia">Tecnologia</option>
                  </select>
                </label>

                {error ? <div className="text-sm text-rose-400">{error}</div> : null}

                <Button type="submit" className="w-full py-6 bg-[#2563EB] hover:bg-blue-600 rounded-lg text-md font-bold shadow-lg shadow-blue-500/20 group">
                  {loading ? "Registrando..." : "Registrar empresa"} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Right Side: Demo Accounts */}
        <div className="flex-1 w-full max-w-md">
          <Card className="p-8 bg-[#111827]/40 backdrop-blur-md border border-white/5 border-dashed">
            <div className="flex items-center gap-2 mb-6 text-slate-400 text-sm font-semibold uppercase tracking-widest">
              <Fingerprint className="w-4 h-4" /> Acesso Demonstração
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Para testes do sistema, escolha um dos perfis pré-configurados abaixo para entrar com as parametrizações e permissões específicas de cada nicho.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => loginAsDemo("G-Tech Master", "Master", true)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-[#2563EB]/40 hover:border-[#2563EB] hover:bg-[#2563EB]/10 transition-all text-left group"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">G-Tech Administrador <span className="px-2 py-0.5 rounded text-[10px] bg-[#2563EB] text-white">SaaS Admin</span></div>
                  <div className="text-xs text-slate-400 mt-1">Acesso completo a todas as empresas</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2563EB] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => loginAsDemo("SolarCorp Engenharia", "Solar", false)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all text-left group"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">Energia Solar <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-500">Tenant</span></div>
                  <div className="text-xs text-slate-400 mt-1">Integrações de propostas e funil técnico</div>
                </div>
                <ArrowRight className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => loginAsDemo("Imobiliária Prime", "Imobiliária", false)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left group"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">Imobiliária <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">Tenant</span></div>
                  <div className="text-xs text-slate-400 mt-1">Funil de corretores, visitas e contratos</div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => loginAsDemo("Clínica Vida", "Clínica", false)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all text-left group"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">Clínica & Saúde <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400">Tenant</span></div>
                  <div className="text-xs text-slate-400 mt-1">Automação de agendamentos e follow-up</div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
