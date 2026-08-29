import { useMemo } from "react";
import { useData } from "../contexts/DataContext";

const DEFAULT_DEPARTAMENTOS = [
  "Tecnologia",
  "Vendas",
  "Marketing",
  "Sucesso do Cliente",
  "Produto",
  "Design",
  "Financeiro",
  "Administrativo",
  "RH",
  "Operações",
  "Geral",
];

export function useDepartamentoOptions(): string[] {
  const { squads } = useData();

  return useMemo(() => {
    const fromSquads = Array.from(
      new Set(squads.map((s: any) => s.departamento).filter(Boolean))
    );
    if (fromSquads.length === 0) return DEFAULT_DEPARTAMENTOS;
    return Array.from(new Set([...fromSquads, ...DEFAULT_DEPARTAMENTOS]));
  }, [squads]);
}
