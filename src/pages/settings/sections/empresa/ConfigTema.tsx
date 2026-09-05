import { Palette, Check } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { toast } from "sonner";
import { useData } from "../../../../contexts/DataContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { BRAND_COLORS } from "../../../../lib/theme";
import { Logo } from "../../../../components/ui/Logo";

export function ConfigTema() {
  const { user } = useAuth();
  const { tenantPrimaryColor, updateTenantPrimaryColor } = useData();
  const canEdit = !!(user?.isMaster || user?.isTenantAdmin);

  const handlePick = async (hex: string) => {
    if (!canEdit || hex === tenantPrimaryColor) return;
    const result = await updateTenantPrimaryColor(hex);
    if (result.success) toast.success("Cor do tema atualizada.");
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          Tema <Palette className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Escolha a cor de destaque do S.P.Y. para a sua empresa. Vale para todos os usuários deste tenant.
        </p>
      </div>

      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <Palette className="w-4 h-4 text-[var(--color-primary-blue)]" /> Cor de marca
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BRAND_COLORS.map((c) => {
            const isSelected = tenantPrimaryColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                disabled={!canEdit}
                onClick={() => handlePick(c.hex)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col items-center gap-3 ${
                  isSelected
                    ? "border-[var(--color-primary-blue)] bg-[var(--color-primary-blue)]/10 shadow-xs"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-default)]"
                } ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: c.hex }} />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-primary-blue)] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">{c.label}</p>
              </button>
            );
          })}
        </div>

        {!canEdit && (
          <p className="text-xs text-[var(--color-text-faint)]">
            Só administradores da empresa podem alterar o tema.
          </p>
        )}
      </Card>

      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          Pré-visualização
        </h3>
        <div className="flex items-center gap-4 p-5 rounded-xl bg-[#0B1120] shadow-[0_0_28px_-8px_var(--color-primary-blue)]">
          <Logo variant="full" color={tenantPrimaryColor} size={40} />
        </div>
        <p className="text-[11px] text-[var(--color-text-faint)]">
          É assim que sua marca aparece no modo escuro — o brilho acompanha a cor escolhida.
        </p>
      </Card>
    </div>
  );
}
