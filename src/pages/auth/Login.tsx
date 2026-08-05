import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { DemoAccessPanel } from "./components/DemoAccessPanel";

export default function Login() {
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
            <p className="text-[var(--color-text-muted)] text-sm">Acesse a plataforma com sua conta corporativa.</p>
          </div>

          <LoginForm />
        </div>

        {/* Right Side */}
        <div className="flex-1 w-full max-w-md">
          <DemoAccessPanel />
        </div>
      </div>
    </div>
  );
}
