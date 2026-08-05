import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { DemoAccessPanel } from "./components/DemoAccessPanel";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [logoDarkFull, setLogoDarkFull] = useState(() => localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");

  useEffect(() => {
    const handleBrandChange = () => setLogoDarkFull(localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
    window.addEventListener("axis_brand_changed", handleBrandChange);
    return () => window.removeEventListener("axis_brand_changed", handleBrandChange);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)] font-sans flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-4xl p-6 relative z-10 flex flex-col md:flex-row gap-8 items-start">

        {/* Left Side */}
        <div className="flex-1 w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="relative inline-block bg-[#0B1120] rounded-2xl overflow-hidden p-4 shadow-lg shadow-blue-500/10 mb-6">
              <img
                src={logoDarkFull}
                alt="Axis CRM Logo"
                title="Axis CRM"
                className="logo-container mx-auto h-auto w-64 max-w-full mix-blend-screen"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--color-text-primary)]">Bem-vindo ao Axis CRM</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Acesse a plataforma ou cadastre sua empresa parceira.</p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${mode === "login" ? "bg-[#2563EB] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:bg-[var(--color-border-default)]"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${mode === "register" ? "bg-[#2563EB] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:bg-[var(--color-border-default)]"}`}
            >
              Registrar
            </button>
          </div>

          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Right Side */}
        <div className="flex-1 w-full max-w-md">
          <DemoAccessPanel />
        </div>
      </div>
    </div>
  );
}
