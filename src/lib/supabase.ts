import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize client if credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log Supabase configuration status
if (!supabase) {
  console.warn(
    "Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set. " +
    "Axis CRM will fall back to local offline storage persistence automatically."
  );
}
