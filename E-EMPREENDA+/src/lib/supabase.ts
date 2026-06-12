import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Supabase anon key can be a JWT ("eyJ...") — classic format
// OR the newer "sb_publishable_..." format introduced in 2025
const isValidUrl = typeof url === 'string' && url.startsWith('https://')
const isValidKey = typeof key === 'string' && (key.startsWith('eyJ') || key.startsWith('sb_'))

const SAFE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMH0.fake_placeholder_key'

if (!isValidUrl || !isValidKey) {
  console.warn(
    '[Supabase] Invalid env vars. Get URL and anon key from: Supabase Dashboard → Project Settings → API'
  )
}

// Always pass valid-format strings to createClient to avoid runtime crashes
export const supabase = createClient(
  isValidUrl ? url : 'https://placeholder.supabase.co',
  isValidKey ? key : SAFE_JWT
)

export const AXIS = {
  TENANT_ID:   '27ef95ee-84dd-499e-9f25-cd9baecb5fe4',
  PIPELINE_ID: 'edb44aee-8569-48e1-a52c-61e0a31317e2', // SDR (pré-venda)
  STAGE_ID:    '7542d9bc-5322-403c-9eab-89f0047ea631', // Novo Lead
  SELLER_ID:   '40a13d8c-1b21-444b-b987-88ad84b9effe', // ANNA CRISTINY
  // Campos camelCase usados pelo CRM para filtrar leads no kanban
  PIPELINE_SLUG: 'sdr',
  STAGE_SLUG:    'sdr-1',
}

