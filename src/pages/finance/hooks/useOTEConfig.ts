import { useState, useEffect } from 'react';

export interface OTEProfile {
  id: string;
  cargo: 'Closer' | 'SDR' | 'Gestor';
  nivel: string;
  salarioFixo: number;
  variavelAlvo: number;
  aceleradorPercent: number; // % bonus on variavelAlvo for each % above 100
  thresholdMinimo: number;   // min atingimento % to earn any variable
}

export interface CommissionRule {
  id: string;
  nome: string;
  faixaMin: number;
  faixaMax: number;
  percentComissao: number;
}

export interface PartnershipRule {
  id: string;
  tipo: string;
  descricao: string;
  percentSplit: number;
}

export interface TaxRate {
  id: string;
  nome: string;
  percent: number;
  aplicaEm: 'variavel' | 'total' | 'acelerador';
}

const DEFAULT_PROFILES: OTEProfile[] = [
  { id: 'p1', cargo: 'Closer', nivel: 'Aprendiz',  salarioFixo: 1620,  variavelAlvo: 2000, aceleradorPercent: 1.5, thresholdMinimo: 30 },
  { id: 'p2', cargo: 'Closer', nivel: 'Junior 1',  salarioFixo: 1620,  variavelAlvo: 3000, aceleradorPercent: 2.0, thresholdMinimo: 30 },
  { id: 'p3', cargo: 'Closer', nivel: 'Junior 2',  salarioFixo: 2000,  variavelAlvo: 4000, aceleradorPercent: 2.5, thresholdMinimo: 30 },
  { id: 'p4', cargo: 'Closer', nivel: 'Pleno',     salarioFixo: 2800,  variavelAlvo: 6000, aceleradorPercent: 3.0, thresholdMinimo: 30 },
  { id: 'p5', cargo: 'SDR',    nivel: 'Aprendiz',  salarioFixo: 1200,  variavelAlvo: 1500, aceleradorPercent: 1.0, thresholdMinimo: 40 },
  { id: 'p6', cargo: 'SDR',    nivel: 'Junior 1',  salarioFixo: 1500,  variavelAlvo: 2000, aceleradorPercent: 1.5, thresholdMinimo: 40 },
  { id: 'p7', cargo: 'Gestor', nivel: 'Senior',    salarioFixo: 5000,  variavelAlvo: 8000, aceleradorPercent: 2.0, thresholdMinimo: 50 },
];

const DEFAULT_COMMISSION_RULES: CommissionRule[] = [
  { id: 'r1', nome: 'Básico',       faixaMin: 0,   faixaMax: 49,  percentComissao: 0   },
  { id: 'r2', nome: 'Progressivo',  faixaMin: 50,  faixaMax: 79,  percentComissao: 3   },
  { id: 'r3', nome: 'Alvo',         faixaMin: 80,  faixaMax: 99,  percentComissao: 5   },
  { id: 'r4', nome: 'Meta Plena',   faixaMin: 100, faixaMax: 119, percentComissao: 6   },
  { id: 'r5', nome: 'Acelerador',   faixaMin: 120, faixaMax: 999, percentComissao: 8   },
];

const DEFAULT_PARTNERSHIP_RULES: PartnershipRule[] = [
  { id: 'pr1', tipo: 'Co-venda',   descricao: 'Split entre dois closers na mesma oportunidade', percentSplit: 50 },
  { id: 'pr2', tipo: 'Indicação',  descricao: 'Bônus para quem indicou o lead', percentSplit: 10 },
  { id: 'pr3', tipo: 'SDR → Closer', descricao: 'Parcela do SDR por cada deal convertido', percentSplit: 15 },
];

const DEFAULT_TAX_RATES: TaxRate[] = [
  { id: 't1', nome: 'INSS',    percent: 11,  aplicaEm: 'total' },
  { id: 't2', nome: 'IR',      percent: 7.5, aplicaEm: 'total' },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function save<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function useOTEConfig() {
  const [profiles, setProfilesRaw]     = useState<OTEProfile[]>(() => load('ote_profiles', DEFAULT_PROFILES));
  const [commRules, setCommRulesRaw]   = useState<CommissionRule[]>(() => load('ote_comm_rules', DEFAULT_COMMISSION_RULES));
  const [partRules, setPartRulesRaw]   = useState<PartnershipRule[]>(() => load('ote_part_rules', DEFAULT_PARTNERSHIP_RULES));
  const [taxRates, setTaxRatesRaw]     = useState<TaxRate[]>(() => load('ote_tax_rates', DEFAULT_TAX_RATES));

  const setProfiles   = (v: OTEProfile[])      => { setProfilesRaw(v);   save('ote_profiles', v); };
  const setCommRules  = (v: CommissionRule[])  => { setCommRulesRaw(v);  save('ote_comm_rules', v); };
  const setPartRules  = (v: PartnershipRule[]) => { setPartRulesRaw(v);  save('ote_part_rules', v); };
  const setTaxRates   = (v: TaxRate[])         => { setTaxRatesRaw(v);   save('ote_tax_rates', v); };

  const getProfile = (cargo: string, nivel: string): OTEProfile | undefined =>
    profiles.find(p => p.cargo === cargo && p.nivel === nivel);

  const calcOTE = (profile: OTEProfile, atingimento: number) => {
    const fixo = profile.salarioFixo;
    const varFrac = Math.min(atingimento / 100, 1);
    const variavel = atingimento >= profile.thresholdMinimo
      ? varFrac * profile.variavelAlvo
      : 0;
    const acelerador = atingimento > 100
      ? ((atingimento - 100) * profile.aceleradorPercent / 100) * profile.variavelAlvo
      : 0;
    return { fixo, variavel, acelerador, totalOTE: fixo + variavel + acelerador };
  };

  const addProfile   = (p: Omit<OTEProfile, 'id'>)    => setProfiles([...profiles,  { ...p, id: `p${Date.now()}` }]);
  const removeProfile = (id: string)                    => setProfiles(profiles.filter(p => p.id !== id));
  const updateProfile = (id: string, p: Partial<OTEProfile>) =>
    setProfiles(profiles.map(x => x.id === id ? { ...x, ...p } : x));

  const addCommRule   = (r: Omit<CommissionRule, 'id'>) => setCommRules([...commRules,  { ...r, id: `r${Date.now()}` }]);
  const removeCommRule = (id: string)                    => setCommRules(commRules.filter(r => r.id !== id));

  const addPartRule   = (r: Omit<PartnershipRule, 'id'>) => setPartRules([...partRules,  { ...r, id: `pr${Date.now()}` }]);
  const removePartRule = (id: string)                     => setPartRules(partRules.filter(r => r.id !== id));

  const addTaxRate    = (t: Omit<TaxRate, 'id'>)        => setTaxRates([...taxRates,   { ...t, id: `t${Date.now()}` }]);
  const removeTaxRate = (id: string)                     => setTaxRates(taxRates.filter(t => t.id !== id));

  return {
    profiles, setProfiles, addProfile, removeProfile, updateProfile,
    commRules, setCommRules, addCommRule, removeCommRule,
    partRules, setPartRules, addPartRule, removePartRule,
    taxRates, setTaxRates, addTaxRate, removeTaxRate,
    getProfile, calcOTE,
  };
}
