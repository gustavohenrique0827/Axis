import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export interface ExamePedido {
  id: string | number;
  patient: string;
  exam: string;
  date: string;
  lab: string;
  status: string;
  result: string;
}

const MOCK_EXAMES: ExamePedido[] = [
  { id: '1', patient: 'Ricardo Oliveira', exam: 'Hemograma Completo', date: '25 Mai, 2026', lab: 'Lab Vértice Central', status: 'Finalizado', result: 'Normal' },
  { id: '2', patient: 'Beatriz Santos', exam: 'Ressonância Magnética (Joelho)', date: '28 Mai, 2026', lab: 'Imobiliz Imagem', status: 'Em Análise', result: '-' },
  { id: '3', patient: 'Marcelo Dias', exam: 'Glicemia de Jejum', date: '24 Mai, 2026', lab: 'Lab Vértice Central', status: 'Finalizado', result: 'Alerta' },
  { id: '4', patient: 'Fátima Lima', exam: 'Eletrocardiograma', date: '28 Mai, 2026', lab: 'CardioClin', status: 'Aguardando Coleta', result: '-' },
];

function rowToExame(row: any): ExamePedido {
  return {
    id: row.id,
    patient: row.patient,
    exam: row.exam,
    date: row.date,
    lab: row.lab || '',
    status: row.status,
    result: row.result || '-',
  };
}

export function useExames() {
  const [exames, setExames] = useState<ExamePedido[]>(supabase ? [] : MOCK_EXAMES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('exames_pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data !== null) {
        setExames(data.map(rowToExame));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addExame(payload: { patient: string; exam: string; date: string; lab: string }) {
    if (!supabase) {
      setExames(prev => [{ id: Date.now(), ...payload, status: 'Aguardando Coleta', result: '-' }, ...prev]);
      toast.success('Pedido criado!');
      return;
    }
    const { data, error } = await supabase
      .from('exames_pedidos')
      .insert({ patient: payload.patient, exam: payload.exam, date: payload.date, lab: payload.lab, status: 'Aguardando Coleta', result: '-' })
      .select()
      .maybeSingle();
    if (error) { toast.error('Erro ao criar pedido'); return; }
    if (data) {
      setExames(prev => [rowToExame(data), ...prev]);
      toast.success('Pedido criado!');
    }
  }

  return { exames, loading, addExame };
}
