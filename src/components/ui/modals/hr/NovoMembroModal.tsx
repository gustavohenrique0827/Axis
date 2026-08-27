import React, { useEffect, useMemo, useState } from "react";
import { UserPlus, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Modal } from "../../modal";
import { Button } from "../../button";
import { useData } from "../../../../contexts/DataContext";

export type NovoMembroPayload = {
  nome: string;
  email: string;
  phone: string;
  senha: string;
  cargo: string;
  departamento: string;
  squad: string;
};

type NovoMembroModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NovoMembroPayload) => void;
  title?: string;
  submitText?: string;
  initialValue?: Partial<NovoMembroPayload> | null;
};

const labelClass = "text-xs font-bold text-[var(--color-text-muted)] mb-1 block";
const inputBaseClass =
  "w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all";

export function NovoMembroModal({
  isOpen,
  onClose,
  onSave,
  title = "Novo Colaborador / Membro",
  submitText = "Adicionar à Equipe",
  initialValue,
}: NovoMembroModalProps) {
  const [nome, setNome] = useState(initialValue?.nome || "");
  const [email, setEmail] = useState(initialValue?.email || "");
  const [phone, setPhone] = useState(initialValue?.phone || "");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [cargo, setCargo] = useState(initialValue?.cargo || "");
  const [departamento, setDepartamento] = useState(initialValue?.departamento || "");
  const [squad, setSquad] = useState("");
  const [loading, setLoading] = useState(false);
  const { cargos, squads } = useData();

  useEffect(() => {
    if (!isOpen) return;
    setNome(initialValue?.nome || "");
    setEmail(initialValue?.email || "");
    setPhone(initialValue?.phone || "");
    setSenha("");
    setShowSenha(false);
    setCargo(initialValue?.cargo || "");
    setDepartamento(initialValue?.departamento || "");
    setSquad("");
    setLoading(false);
  }, [isOpen, initialValue]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    return Boolean(nome.trim() && email.trim());
  }, [loading, nome, email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      onSave({
        nome: nome.trim(),
        email: email.trim(),
        phone: phone.trim(),
        senha: senha || "123456",
        cargo: cargo.trim() || "Colaborador",
        departamento: departamento.trim() || "Geral",
        squad: squad.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelClass}>E-mail Corporativo *</label>
            <input
              type="email"
              required
              placeholder="joao@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBaseClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Telefone / WhatsApp</label>
            <input
              type="tel"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelClass}>Senha de Acesso</label>
            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                placeholder="Padrão: 123456"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={inputBaseClass}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                {showSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Cargo / Função</label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Selecione...</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
              <option value="SDR / Pré-Vendas">SDR / Pré-Vendas</option>
              <option value="Closer / Executivo">Closer / Executivo</option>
              <option value="Gerente Comercial">Gerente Comercial</option>
              <option value="Analista de Suporte">Analista de Suporte</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Departamento</label>
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Selecione...</option>
              <option value="Vendas">Vendas</option>
              <option value="Marketing">Marketing</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Sucesso do Cliente">Sucesso do Cliente</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Operações">Operações</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Squad</label>
            <select
              value={squad}
              onChange={(e) => setSquad(e.target.value)}
              className={inputBaseClass}
            >
              <option value="">Sem squad</option>
              {squads.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--color-border-subtle)]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 text-xs font-bold border-[var(--color-border-default)]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className="h-9 px-5 text-xs font-bold shadow-xs"
          >
            {loading ? "Salvando..." : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}