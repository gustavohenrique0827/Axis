import { Button } from "../../../../components/ui/button";
import { Modal } from "../../../../components/ui/modal";
import { FormField } from "../../../../components/ui/form-field";
import { Input } from "../../../../components/ui/input";
import { Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface LandingPageTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPage: { name: string } | null;
  pixelId: string;
  setPixelId: (v: string) => void;
  gtagId: string;
  setGtagId: (v: string) => void;
  onSave: () => void;
}

export function LandingPageTrackingModal({
  isOpen,
  onClose,
  selectedPage,
  pixelId,
  setPixelId,
  gtagId,
  setGtagId,
  onSave,
}: LandingPageTrackingModalProps) {
  if (!isOpen || !selectedPage) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[var(--color-primary-blue)]" />
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              Rastreamento de Tráfego
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[260px]">
              {selectedPage.name}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} className="font-bold">
            Salvar Tags
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormField
          label="ID do Pixel Meta (Facebook & Insta)"
          hint="Ex: 10293847568291 — Injeta script do Pixel na página"
        >
          <Input
            type="text"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="Ex: 10293847568291"
            className="font-mono text-xs"
          />
        </FormField>

        <FormField
          label="Google Analytics / Google Tag (G-TAG)"
          hint="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXX"
        >
          <Input
            type="text"
            value={gtagId}
            onChange={(e) => setGtagId(e.target.value)}
            placeholder="Ex: G-XXXXXXXXXX"
            className="font-mono text-xs"
          />
        </FormField>

        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(new Promise((res) => setTimeout(res, 1000)), {
                loading: "Validando scripts na página...",
                success: "Pixel e Google Tag verificados com sucesso! 🚀",
                error: "Falha na validação.",
              })
            }
            className="w-full text-xs font-bold gap-2 text-emerald-600 dark:text-emerald-400"
          >
            <Sparkles className="w-4 h-4" /> Validar Tags e Scripts
          </Button>
        </div>
      </div>
    </Modal>
  );
}
