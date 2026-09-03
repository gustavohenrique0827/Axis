import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children, requireMaster = false }: { children: React.ReactElement; requireMaster?: boolean }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  // Aguarda a sessão do Supabase Auth ser resolvida (getSession) antes de
  // decidir — evita um redirect falso para /login em cada refresh de página
  // enquanto a sessão real ainda está sendo carregada.
  if (authLoading) {
    return null;
  }

  if (!user) {
    // If not logged in, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Defesa em profundidade: o RLS já bloqueia dados de outros tenants no banco,
  // mas rotas administrativas de plataforma (ex.: /app/admin) não deveriam nem
  // renderizar pra quem não é master — sem isso, a única barreira era a RLS.
  if (requireMaster && !user.isMaster) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
