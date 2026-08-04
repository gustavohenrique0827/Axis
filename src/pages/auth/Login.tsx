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
            <div className="relative inline-block bg-[var(--color-surface)] rounded-2xl overflow-hidden p-3 border border-white/5 mb-6">
              <img
                src={logoDarkFull}
                alt="Axis CRM Logo"
                title="Axis CRM"
                className="logo-container mx-auto h-auto w-64 max-w-full mix-blend-screen"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Bem-vindo ao Axis CRM</h1>
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
