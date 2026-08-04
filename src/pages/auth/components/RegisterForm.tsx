import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Lock, Mail, ArrowRight, Building, Phone, UserCheck } from "lucide-react";
import { useAuth, TenantNiche } from "../../../contexts/AuthContext";
import { registerPartner } from "../../../lib/supabase";
import { toast } from "sonner";

export function RegisterForm() {
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [niche, setNiche] = useState<TenantNiche>("Parceira");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/app/dashboard";

  const fieldClass = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!companyName || !email || !password || !confirmPassword || !phone) {
      setError("Preencha todos os campos obrigatórios."); return;
    }
    if (password !== confirmPassword) { setError("As senhas precisam ser iguais."); return; }
    setLoading(true);
    try {
      const result = await registerPartner(companyName, email, password, phone, niche);
      if (!result.success) {
        setError(result.error || "Erro ao registrar empresa");
        toast.error(result.error || "Erro ao registrar empresa");
        return;
      }
      if (result.needsEmailConfirmation) {
        toast.success("Empresa registrada! Confirme seu e-mail para poder entrar.");
        navigate("/login", { replace: true });
        return;
      }
      if (result.user) {
        login(result.user);
      }
      toast.success(`Bem-vindo, ${companyName}! Empresa registrada com sucesso.`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido no registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-400 font-semibold">Nome da Empresa</span>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={fieldClass} placeholder="Ex: Axis Parceira" />
            </div>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400 font-semibold">Telefone</span>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} placeholder="(XX) XXXXX-XXXX" />
            </div>
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-slate-400 font-semibold">E-mail Corporativo</span>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} placeholder="contato@empresa.com" />
          </div>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-400 font-semibold">Senha</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} placeholder="••••••••" />
            </div>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400 font-semibold">Confirmar senha</span>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={fieldClass} placeholder="••••••••" />
            </div>
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-slate-400 font-semibold">Segmento</span>
          <select value={niche} onChange={(e) => setNiche(e.target.value as TenantNiche)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]">
            <option value="Parceira">Parceira</option>
            <option value="Solar">Solar</option>
            <option value="Imobiliária">Imobiliária</option>
            <option value="Clínica">Clínica</option>
            <option value="Tecnologia">Tecnologia</option>
          </select>
        </label>

        {error && <div className="text-sm text-rose-400">{error}</div>}

        <Button type="submit" className="w-full py-6 bg-[#2563EB] hover:bg-blue-600 rounded-lg text-md font-semibold group">
          {loading ? "Registrando..." : "Registrar empresa"} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Card>
  );
}
