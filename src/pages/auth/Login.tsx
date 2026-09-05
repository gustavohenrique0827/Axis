import { LoginForm } from "./components/LoginForm";
import { Logo } from "../../components/ui/Logo";

export default function Login() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)] font-sans flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-xl p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block bg-[#0B1120] rounded-2xl overflow-hidden p-6 shadow-lg shadow-blue-500/10 mb-6">
            <Logo variant="full" size={56} className="mx-auto justify-center" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">Bem-vindo ao S.P.Y.</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Acesse a plataforma com sua conta corporativa.</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
