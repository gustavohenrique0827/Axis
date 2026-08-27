import { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';

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

// Modelo de comissão escolhido pelo tenant — define qual fórmula calcOTE aplica:
// 'acelerador'  — variável proporcional ao atingimento (por perfil) + acelerador linear acima de 100%.
// 'faixas'      — comissão = % da faixa de atingimento (commRules) aplicado sobre o realizado.
// 'faturamento' — comissão = % fixo do realizado (percentFaturamento) + bônus fixo ao bater a meta.
export type ModeloComissao = 'acelerador' | 'faixas' | 'faturamento';

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

const SETTING_KEY = 'ote_config';
const DEFAULT_MODELO: ModeloComissao = 'acelerador';
const DEFAULT_PERCENT_FATURAMENTO = 5;
const DEFAULT_BONUS_META_BATIDA = 500;

interface OTEConfigBlob {
  profiles: OTEProfile[];
  commRules: CommissionRule[];
  partRules: PartnershipRule[];
  taxRates: TaxRate[];
  modeloComissao: ModeloComissao;
  percentFaturamento: number;
  bonusMetaBatida: number;
}

export function useOTEConfig() {
  const { appSettings, saveAppSetting } = useData();

  const [profiles, setProfilesRaw]     = useState<OTEProfile[]>(DEFAULT_PROFILES);
  const [commRules, setCommRulesRaw]   = useState<CommissionRule[]>(DEFAULT_COMMISSION_RULES);
  const [partRules, setPartRulesRaw]   = useState<PartnershipRule[]>(DEFAULT_PARTNERSHIP_RULES);
  const [taxRates, setTaxRatesRaw]     = useState<TaxRate[]>(DEFAULT_TAX_RATES);
  const [modeloComissao, setModeloComissaoRaw] = useState<ModeloComissao>(DEFAULT_MODELO);
  const [percentFaturamento, setPercentFaturamentoRaw] = useState<number>(DEFAULT_PERCENT_FATURAMENTO);
  const [bonusMetaBatida, setBonusMetaBatidaRaw] = useState<number>(DEFAULT_BONUS_META_BATIDA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const saved: OTEConfigBlob | undefined = appSettings?.[SETTING_KEY];
    if (saved) {
      setProfilesRaw(saved.profiles ?? DEFAULT_PROFILES);
      setCommRulesRaw(saved.commRules ?? DEFAULT_COMMISSION_RULES);
      setPartRulesRaw(saved.partRules ?? DEFAULT_PARTNERSHIP_RULES);
      setTaxRatesRaw(saved.taxRates ?? DEFAULT_TAX_RATES);
      setModeloComissaoRaw(saved.modeloComissao ?? DEFAULT_MODELO);
      setPercentFaturamentoRaw(saved.percentFaturamento ?? DEFAULT_PERCENT_FATURAMENTO);
      setBonusMetaBatidaRaw(saved.bonusMetaBatida ?? DEFAULT_BONUS_META_BATIDA);
      setHydrated(true);
    }
  }, [appSettings, hydrated]);

  const persist = (next: Partial<OTEConfigBlob>) => {
    setHydrated(true);
    saveAppSetting(SETTING_KEY, {
      profiles: next.profiles ?? profiles,
      commRules: next.commRules ?? commRules,
      partRules: next.partRules ?? partRules,
      taxRates: next.taxRates ?? taxRates,
      modeloComissao: next.modeloComissao ?? modeloComissao,
      percentFaturamento: next.percentFaturamento ?? percentFaturamento,
      bonusMetaBatida: next.bonusMetaBatida ?? bonusMetaBatida,
    });
  };

  const setProfiles   = (v: OTEProfile[])      => { setProfilesRaw(v);   persist({ profiles: v }); };
  const setCommRules  = (v: CommissionRule[])  => { setCommRulesRaw(v);  persist({ commRules: v }); };
  const setPartRules  = (v: PartnershipRule[]) => { setPartRulesRaw(v);  persist({ partRules: v }); };
  const setTaxRates   = (v: TaxRate[])         => { setTaxRatesRaw(v);   persist({ taxRates: v }); };
  const setModeloComissao = (v: ModeloComissao) => { setModeloComissaoRaw(v); persist({ modeloComissao: v }); };
  const setPercentFaturamento = (v: number) => { setPercentFaturamentoRaw(v); persist({ percentFaturamento: v }); };
  const setBonusMetaBatida = (v: number) => { setBonusMetaBatidaRaw(v); persist({ bonusMetaBatida: v }); };

  const getProfile = (cargo: string, nivel: string): OTEProfile | undefined =>
    profiles.find(p => p.cargo === cargo && p.nivel === nivel);

  // `realizado` (R$ efetivamente vendido) só é necessário para os modelos 'faixas' e
  // 'faturamento' — o modelo 'acelerador' calcula tudo a partir do %-atingimento e do
  // variavelAlvo do perfil, sem precisar do valor monetário bruto.
  const calcOTE = (profile: OTEProfile, atingimento: number, realizado = 0) => {
    const fixo = profile.salarioFixo;

    if (modeloComissao === 'faixas') {
      const rule = commRules.find(r => atingimento >= r.faixaMin && atingimento <= r.faixaMax);
      const variavel = atingimento >= profile.thresholdMinimo && rule
        ? (rule.percentComissao / 100) * realizado
        : 0;
      return { fixo, variavel, acelerador: 0, totalOTE: fixo + variavel };
    }

    if (modeloComissao === 'faturamento') {
      const variavel = atingimento >= profile.thresholdMinimo
        ? (percentFaturamento / 100) * realizado
        : 0;
      const acelerador = atingimento >= 100 ? bonusMetaBatida : 0;
      return { fixo, variavel, acelerador, totalOTE: fixo + variavel + acelerador };
    }

    // 'acelerador' (padrão)
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
    modeloComissao, setModeloComissao,
    percentFaturamento, setPercentFaturamento,
    bonusMetaBatida, setBonusMetaBatida,
    getProfile, calcOTE,
  };
}
