import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { 
  User, Mail, Phone, Briefcase, Camera, 
  ShieldCheck, KeyRound, Smartphone, LogOut, 
  Save, CheckCircle2, AlertCircle, Sparkles, Building
} from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "sonner";

export function ConfigPerfilUsuario() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "Gustavo Portilho");
  const [email, setEmail] = useState(user?.email || "gustavo@axis.com.br");
  const [phone, setPhone] = useState((user as any)?.phone || "(11) 98765-4321");
  const [role, setRole] = useState(user?.role || "Diretor de Operações / Master");
  const [bio, setBio] = useState("Liderança estratégica, gestão de receita e automação de operações de alta performance.");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Security Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success("Foto de perfil carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast.success("Perfil atualizado com sucesso!");
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação de senha não confere.");
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso!");
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          Meu Perfil & Conta <User className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Gerencie suas informações pessoais, dados de acesso, cargo e segurança de dois fatores.
        </p>
      </div>

      {/* Header Profile Card */}
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-blue)] text-white flex items-center justify-center text-2xl font-black shadow-md overflow-hidden border-2 border-[var(--color-border-default)]">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                name.substring(0, 2).toUpperCase()
              )}
            </div>
            <label 
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 p-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] hover:text-[var(--color-primary-blue)] cursor-pointer shadow-md transition-transform hover:scale-105"
              title="Alterar Foto"
            >
              <Camera className="w-3.5 h-3.5" />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{name}</h2>
              <Badge variant="info">
                {user?.isMaster ? "Master / Admin" : "Membro"}
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Building className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" />
              {user?.tenantName || "Axis Corporation"} • {role}
            </p>
            <p className="text-[11px] text-[var(--color-text-faint)] font-mono">{email}</p>
          </div>
        </div>
      </Card>

      {/* Personal Info Form */}
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-6">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <User className="w-4 h-4 text-[var(--color-primary-blue)]" /> Informações Pessoais & Profissionais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">E-mail de Acesso</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Telefone / WhatsApp</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Cargo / Especialidade</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Bio / Apresentação Curta</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] p-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSaveProfile} disabled={savingProfile} className="h-9 px-5 text-xs font-bold gap-1.5 shadow-xs">
            <Save className="w-3.5 h-3.5" />
            {savingProfile ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </div>
      </Card>

      {/* Security Section */}
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-6">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <KeyRound className="w-4 h-4 text-emerald-500" /> Segurança & Alteração de Senha
        </h3>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Senha Atual</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Nova Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Confirmar Nova Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <Button type="submit" variant="outline" disabled={savingPassword} className="h-9 px-5 text-xs font-bold gap-1.5 border-[var(--color-border-default)]">
              {savingPassword ? "Atualizando..." : "Atualizar Senha"}
            </Button>
          </div>
        </form>

        {/* 2FA Section */}
        <div className="p-4 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Autenticação em Duas Etapas (2FA)</h4>
                <Badge variant={is2FAEnabled ? "success" : "secondary"}>
                  {is2FAEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Proteja sua conta solicitando um código de segurança adicional a cada login.
              </p>
            </div>
          </div>

          <Button 
            variant="outline"
            size="xs"
            onClick={() => {
              setIs2FAEnabled(!is2FAEnabled);
              toast.info(`2FA ${!is2FAEnabled ? 'ativado' : 'desativado'}.`);
            }}
            className="shrink-0 border-[var(--color-border-default)]"
          >
            {is2FAEnabled ? "Desativar 2FA" : "Configurar 2FA"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

