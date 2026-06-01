import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Mail, Lock, Building, Phone, UserCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth, TenantNiche } from "../../contexts/AuthContext";

const niches: TenantNiche[] = ["Master", "Solar", "Imobiliária", "Clínica", "Tecnologia", "Parceira"];

export default function Register() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [niche, setNiche] = useState<TenantNiche>("Parceira");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!companyName || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);

    login({
      name: `Parceiro ${companyName}`,
      email,
      role: "Parceiro",
      tenantName: companyName,
      tenantNiche: niche,
      isMaster: false,
    });

    toast.success("Cadastro realizado com sucesso!");
    setLoading(false);
    navigate("/app/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] font-sans flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#2563EB]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#06B6D4]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#111827]/80 border border-white/10 mx-auto mb-4">
            <Building className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cadastro de Empresa Parceira</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Cadastre sua empresa parceira para acessar o ambiente de gestão Axis com sua própria organização.
          </p>
        </div>

        <Card className="p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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

              <label className="space-y-2 text-sm">
                <span className="text-slate-400 font-semibold">Segmento</span>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value as TenantNiche)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                >
                  {niches.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

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

            {error ? <div className="text-sm text-rose-400">{error}</div> : null}

            <Button type="submit" className="w-full py-5 bg-[#2563EB] hover:bg-blue-600 rounded-lg text-md font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              {loading ? "Registrando..." : "Finalizar Cadastro"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Já possui conta? <Link to="/login" className="text-[#2563EB] hover:text-blue-400">Entrar</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
