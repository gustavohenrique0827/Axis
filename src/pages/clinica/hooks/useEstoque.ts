import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export interface EstoqueItem {
  id: string | number;
  name: string;
  category: string;
  qty: number;
  minQty: number;
  status: string;
  price: string;
}

const MOCK_ITEMS: EstoqueItem[] = [
  { id: 1, name: 'Seringa Descartável 5ml', category: 'Descartáveis', qty: 1240, minQty: 500, status: 'Normal', price: 'R$ 0,45' },
  { id: 2, name: 'Luvas Nitrílicas (M)', category: 'EPIs', qty: 150, minQty: 200, status: 'Crítico', price: 'R$ 42,00' },
  { id: 3, name: 'Gaze Estéril 7,5cm', category: 'Curativos', qty: 3200, minQty: 1000, status: 'Normal', price: 'R$ 0,12' },
  { id: 4, name: 'Amoxicilina 500mg', category: 'Medicamentos', qty: 45, minQty: 50, status: 'Alerta', price: 'R$ 18,50' },
  { id: 5, name: 'Álcool 70% (1L)', category: 'Saneantes', qty: 12, minQty: 20, status: 'Alerta', price: 'R$ 14,90' },
];

function computeStatus(qty: number, minQty: number): string {
  if (qty === 0) return 'Crítico';
  if (qty < minQty) return qty < minQty * 0.5 ? 'Crítico' : 'Alerta';
  return 'Normal';
}

function rowToItem(row: any): EstoqueItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'Geral',
    qty: row.qty ?? 0,
    minQty: row.min_qty ?? 0,
    status: row.status || computeStatus(row.qty ?? 0, row.min_qty ?? 0),
    price: row.price || 'R$ 0,00',
  };
}

export function useEstoque() {
  const [items, setItems] = useState<EstoqueItem[]>(supabase ? [] : MOCK_ITEMS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase!
        .from('estoque_items')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data !== null) {
        setItems(data.map(rowToItem));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addItem(payload: { name: string; category: string; qty: number; minQty: number; price: string }) {
    const status = computeStatus(payload.qty, payload.minQty);
    if (!supabase) {
      setItems(prev => [...prev, { id: Date.now(), ...payload, status }]);
      toast.success('Item adicionado!');
      return;
    }
    const { data, error } = await supabase
      .from('estoque_items')
      .insert({ name: payload.name, category: payload.category, qty: payload.qty, min_qty: payload.minQty, price: payload.price, status })
      .select()
      .maybeSingle();
    if (error) { toast.error('Erro ao adicionar item'); return; }
    if (data) {
      setItems(prev => [...prev, rowToItem(data)]);
      toast.success('Item adicionado!');
    }
  }

  return { items, loading, addItem };
}
