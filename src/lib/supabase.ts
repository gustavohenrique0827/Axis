import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url: string): string {
  try {
    const parsed = new URL((url || '').trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseUrl = normalizeSupabaseUrl(supabaseUrlRaw);
const supabaseAnonKey = (supabaseAnonKeyRaw || '').trim();

console.log('[Supabase] env VITE_SUPABASE_URL set?', Boolean(supabaseUrlRaw));
console.log('[Supabase] env VITE_SUPABASE_ANON_KEY set?', Boolean(supabaseAnonKeyRaw));

// Initialize client if credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log Supabase configuration status for debugging
if (supabase) {
  console.log('[Supabase] ✅ Configurado e pronto para uso');
} else {
  console.warn(
    '[Supabase] ⚠️ NÃO CONFIGURADO\n' +
    'URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ Definida' : '✗ Não definida', '\n' +
  'ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Definida' : '✗ Não definida', '\n' +
  'Ação: Reinicie o servidor Vite após configurar .env (npm run dev)'
  );
}

// Persistência em sessão para evitar tentativas repetitivas de DNS que geram erros no console
const CONNECTION_CACHE_KEY = 'axis_supabase_connection_status';
let isReachableCache: boolean | null = (() => {
  if (typeof window === 'undefined') return null;
  const saved = sessionStorage.getItem(CONNECTION_CACHE_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return null;
})();

let reachabilityPromise: Promise<boolean> | null = null;

/**
 * Tests if Supabase is actually reachable (not just configured).
 * Returns false if the URL fails to resolve (ERR_NAME_NOT_RESOLVED, timeout, etc.)
 */
export async function isSupabaseReachable(): Promise<boolean> {
  if (isReachableCache !== null) {
    return isReachableCache;
  }

  if (reachabilityPromise) {
    return reachabilityPromise;
  }

  // Se o navegador estiver offline, não tentamos a conexão
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

  if (!supabase || !supabaseUrl) return false;

  reachabilityPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      isReachableCache = res.ok || res.status === 400;
    } catch {
      // Falha de resolução de nome (DNS) ou rede
      isReachableCache = false;
    } finally {
      if (typeof window !== 'undefined' && isReachableCache !== null) {
        sessionStorage.setItem(CONNECTION_CACHE_KEY, String(isReachableCache));
      }
      reachabilityPromise = null;
    }
    return isReachableCache;
  })();

  return reachabilityPromise;
}

/**
 * Busca o perfil (tenant, role, etc.) de um usuário autenticado no Supabase Auth.
 * Usado tanto no login quanto na restauração de sessão (onAuthStateChange).
 */
export async function fetchUserProfile(userId: string): Promise<{ success: boolean; error?: string; user?: any }> {
  if (!supabase) return { success: false, error: 'Supabase não configurado.' };

  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      role,
      is_master,
      active,
      tenant_id,
      partner_id,
      tenants (
        id,
        name,
        niche
      )
    `)
    .eq("id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Erro ao carregar perfil:', error.message);
    return { success: false, error: "Erro ao carregar perfil do usuário." };
  }

  if (!data) {
    return { success: false, error: "Perfil de usuário não encontrado ou inativo." };
  }

  const tenant = Array.isArray(data.tenants) ? data.tenants[0] : (data.tenants as any);
  if (!tenant) {
    return { success: false, error: "Usuário não possui uma empresa (tenant) vinculada." };
  }

  return {
    success: true,
    user: {
      name: data.name,
      email: data.email,
      role: data.role,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantNiche: tenant.niche,
      isMaster: data.is_master,
      partnerId: data.partner_id ?? undefined,
    },
  };
}

/**
 * Authenticate a user via Supabase Auth (email/senha reais, não mais comparação
 * client-side contra password_hash em Base64).
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado.' };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      const msg = authError?.message === 'Invalid login credentials'
        ? 'E-mail ou senha inválidos.'
        : (authError?.message || 'Erro ao autenticar.');
      return { success: false, error: msg };
    }

    const profile = await fetchUserProfile(authData.user.id);
    if (!profile.success) {
      // Autenticou no Supabase Auth mas não tem perfil válido em public.users — desfaz a sessão.
      await supabase.auth.signOut();
      return profile;
    }

    return profile;
  } catch (err) {
    return { success: false, error: "Erro na conexão com o banco de dados." };
  }
}

/**
 * Cria uma conta no Supabase Auth + o perfil correspondente em public.users.
 *
 * Usa um client Supabase secundário e isolado (sem persistir sessão) para o
 * signUp: chamar auth.signUp() no client principal trocaria a sessão ativa do
 * chamador para a conta recém-criada — um problema quando um admin já logado
 * está criando a conta de outra pessoa (ex.: convidar um colaborador).
 */
export async function createUserWithProfile(params: {
  email: string;
  password: string;
  name: string;
  tenantId: string;
  role: string;
  isMaster?: boolean;
}): Promise<{ success: boolean; error?: string; userId?: string; needsEmailConfirmation?: boolean }> {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return { success: false, error: 'Supabase não configurado.' };
  }

  const isolatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: authData, error: authError } = await isolatedClient.auth.signUp({
    email: params.email,
    password: params.password,
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Erro ao criar conta de acesso.' };
  }

  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    tenant_id: params.tenantId,
    name: params.name,
    email: params.email,
    role: params.role,
    is_master: params.isMaster ?? false,
    active: true,
  });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  return { success: true, userId: authData.user.id, needsEmailConfirmation: !authData.session };
}

/**
 * Register a new partner company and admin user
 */
export async function registerPartner(
  companyName: string,
  email: string,
  password: string,
  _phone: string,
  niche: string
): Promise<{ success: boolean; error?: string; userId?: string; tenantId?: string; needsEmailConfirmation?: boolean; user?: any }> {
  if (!supabase) {
    const errorMsg = 'Supabase não está configurado. Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY faltam. Reinicie o servidor (npm run dev) após configurar .env';
    console.error('[Register] ' + errorMsg);
    console.error('[Env Debug] URL:', import.meta.env.VITE_SUPABASE_URL);
    console.error('[Env Debug] KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
    return { success: false, error: errorMsg };
  }

  try {
    // 0. Verificar se o e-mail já existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: "Este e-mail já está cadastrado no sistema." };
    }

    // 1. Create tenant (company)
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: companyName,
        niche: niche || "Parceira",
        plan: "Standard",
        status: "Active",
        timezone: "America/Sao_Paulo"
      })
      .select()
      .maybeSingle();

    if (tenantError || !tenantData) {
      const errMsg = `Erro ao criar empresa: ${tenantError?.message || "Unknown error"}`;
      console.error('[Register] ' + errMsg, tenantError);
      return { success: false, error: errMsg };
    }

    // 2. Create admin user (Supabase Auth + perfil) for tenant
    const created = await createUserWithProfile({
      email,
      password,
      name: `Admin ${companyName}`,
      tenantId: tenantData.id,
      role: "Admin",
      isMaster: false,
    });

    if (!created.success) {
      // Rollback tenant if user creation fails
      await supabase.from("tenants").delete().eq("id", tenantData.id);
      const errMsg = `Erro ao criar usuário: ${created.error || "Unknown error"}`;
      console.error('[Register] ' + errMsg);
      return { success: false, error: errMsg };
    }

    console.log('[Register] ✅ Parceiro registrado com sucesso', { tenantId: tenantData.id, userId: created.userId });

    // 3. A conta foi criada via client isolado (para não roubar a sessão de quem
    //    já estiver logado neste navegador) — agora autentica de verdade no
    //    client principal, exceto se o projeto exigir confirmação de e-mail.
    if (created.needsEmailConfirmation) {
      return {
        success: true,
        userId: created.userId,
        tenantId: tenantData.id,
        needsEmailConfirmation: true,
      };
    }

    const signInResult = await signIn(email, password);
    return {
      success: true,
      userId: created.userId,
      tenantId: tenantData.id,
      needsEmailConfirmation: false,
      user: signInResult.user,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Erro desconhecido no registro";
    console.error('[Register] ' + errMsg, err);
    return { success: false, error: errMsg };
  }
}

/**
 * Fetch all active tenants from database and transform to TenantModules format
 */
export async function fetchTenants() {
  if (!supabase) {
    console.warn('[Tenants] Supabase não está configurado, usando dados padrão');
    return {};
  }

  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, niche, status, modules")
      .eq("status", "Active")
      .order("name", { ascending: true });

    if (error) {
      if (error.code === '42501') {
        console.warn('[Tenants] ⚠️ Sem permissão RLS na tabela tenants — usando módulos demo locais. Execute o SQL de setup no Supabase SQL Editor para habilitar dados reais.');
      } else {
        console.error('[Tenants] ❌ Erro ao carregar tenants:', error.message, error.code);
      }
      return {};
    }

    console.log(`[Tenants] 📦 Rows retornadas pelo Supabase: ${data?.length ?? 0}`, data?.map((t: any) => t.name));

    if (!data || data.length === 0) {
      console.warn('[Tenants] ⚠️ Supabase retornou array vazio — verifique RLS na tabela tenants. Execute no SQL Editor: CREATE POLICY "anon_read_tenants" ON public.tenants FOR SELECT TO anon USING (true);');
      return {};
    }

    const tenantModules: Record<string, any> = {};

    data.forEach((tenant: any) => {
      tenantModules[tenant.name] = tenant.modules || {
        crm: true,
        sdr: tenant.niche === "Master" || tenant.niche === "Tecnologia",
        advDashboard: tenant.niche === "Master"
      };
    });

    console.log('[Tenants] ✅ Carregados do banco de dados:', Object.keys(tenantModules));
    return tenantModules;
  } catch (err) {
    console.error('[Tenants] ❌ Erro ao carregar tenants:', err);
    return {};
  }
}

/**
 * Returns a map of tenant name → tenant UUID for all active tenants
 */
export async function fetchTenantIdMap(): Promise<Record<string, string>> {
  if (!supabase) return {};
  try {
    const { data } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('status', 'Active');
    if (!data) return {};
    return Object.fromEntries(data.map((t: any) => [t.name, t.id]));
  } catch {
    return {};
  }
}

/**
 * Cria (ou atualiza) o usuário master G-Tech (admin@gthec.com / gthec@2025).
 * Chamado automaticamente pelo painel admin ao detectar ausência do usuário master.
 */
export async function setupMasterUser(): Promise<{ success: boolean; error?: string; alreadyExists?: boolean }> {
  if (!supabase) return { success: false, error: 'Supabase não configurado.' };

  try {
    const MASTER_EMAIL = 'admin@gthec.com';
    const MASTER_PASSWORD = 'gthec@2025';
    const TENANT_NAME = 'G-Tech Master';

    // 1. Garantir que o tenant G-Tech Master existe
    const allModules = {
      crm: true, sdr: true, advDashboard: true, financeiro: true, marketing: true,
      educacao: true, clinica: true, produtividade: true, rh: true, bi: true, engajamento: true
    };

    let { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', TENANT_NAME)
      .maybeSingle();

    if (!tenant) {
      const { data: newTenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert({ name: TENANT_NAME, niche: 'Master', plan: 'Enterprise', status: 'Active', timezone: 'America/Sao_Paulo', modules: allModules })
        .select('id')
        .maybeSingle();
      if (tenantErr || !newTenant) return { success: false, error: `Erro ao criar tenant: ${tenantErr?.message}` };
      tenant = newTenant;
    } else {
      await supabase.from('tenants').update({ modules: allModules }).eq('id', tenant.id);
    }

    // 2. Verificar se o usuário master já existe
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', MASTER_EMAIL)
      .maybeSingle();

    if (existing) {
      await supabase.from('users').update({ is_master: true, active: true, role: 'Super Admin' }).eq('id', existing.id);
      return { success: true, alreadyExists: true };
    }

    // 3. Criar usuário master (Supabase Auth + perfil)
    const created = await createUserWithProfile({
      email: MASTER_EMAIL,
      password: MASTER_PASSWORD,
      name: 'G-Tech Administrador',
      tenantId: tenant.id,
      role: 'Super Admin',
      isMaster: true,
    });

    if (!created.success) return { success: false, error: `Erro ao criar usuário: ${created.error}` };

    console.log('[Setup] ✅ Usuário master gthec criado com sucesso');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

/**
 * Cria um novo tenant parceiro diretamente pelo painel admin, junto com o
 * usuário administrador inicial desse tenant (e-mail/senha reais no Supabase
 * Auth). Diferente de `registerPartner`, NÃO troca a sessão atual para o
 * usuário recém-criado — quem está usando este painel (ex.: G-Tech master)
 * continua logado como está, já que `createUserWithProfile` usa um client
 * Supabase isolado para o signUp.
 */
export async function createTenantAdmin(
  tenantName: string,
  niche: string,
  adminEmail: string,
  adminPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase não configurado' };

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: tenantName,
        niche: niche || 'Parceira',
        plan: 'Standard',
        status: 'Active',
        timezone: 'America/Sao_Paulo',
        modules: { crm: true, sdr: false, advDashboard: false, financeiro: true, marketing: false, educacao: false, clinica: false, produtividade: true, rh: false, bi: false, engajamento: false }
      })
      .select()
      .maybeSingle();

    if (tenantError || !tenantData) {
      return { success: false, error: tenantError?.message || 'Erro ao criar empresa' };
    }

    const created = await createUserWithProfile({
      email: adminEmail,
      password: adminPassword,
      name: `Admin ${tenantName}`,
      tenantId: tenantData.id,
      role: 'Admin',
      isMaster: false,
    });

    if (!created.success) {
      await supabase.from('tenants').delete().eq('id', tenantData.id);
      return { success: false, error: created.error || 'Erro ao criar usuário administrador' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro desconhecido' };
  }
}

/**
 * Atualiza os módulos ativos de um tenant no banco de dados
 */
export async function updateTenantModulesInDB(tenantName: string, modules: any) {
  if (!supabase) return { success: false, error: 'Supabase não configurado' };

  try {
    const { error } = await supabase
      .from("tenants")
      .update({ modules })
      .eq("name", tenantName);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Tenants] ❌ Erro ao salvar módulos:', err);
    return { success: false, error: err };
  }
}
