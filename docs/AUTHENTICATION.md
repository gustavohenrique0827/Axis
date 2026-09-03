# Autenticação

Autenticação é 100% Supabase Auth (JWT). Não existe sessão própria da aplicação, nem cookie assinado por nós — tudo passa pelo `supabase-js` no cliente.

## Login

`src/pages/auth/components/LoginForm.tsx` → `supabase.auth.signInWithPassword({ email, password })` (`src/lib/supabase.ts`). Em caso de sucesso, `AuthContext` (`src/contexts/AuthContext.tsx`) escuta `onAuthStateChange`, busca a linha correspondente em `public.users` (por `id = auth.uid()`) e monta o objeto `user` usado no resto do app (`tenant_id`, `is_master`, papel, etc.).

## "Esqueci a senha" / recuperação

Fluxo padrão do Supabase Auth, sem lógica própria de token:

1. `LoginForm.tsx` → `requestPasswordReset(email)` → `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/redefinir-senha` })`.
2. Supabase envia o e-mail com o link. O toast de confirmação no frontend é **sempre o mesmo**, exista ou não aquele e-mail na base — evita enumeração de contas por e-mail.
3. O link abre `src/pages/auth/ResetPassword.tsx`, que chama `updatePassword(newPassword)` → `supabase.auth.updateUser({ password })`, usando a sessão temporária que o próprio Supabase injeta ao seguir o link.

Não existe (e não deve existir) nenhum endpoint próprio de "reset de senha" em `server.ts` — delegar isso ao Supabase Auth evita reimplementar geração/expiração/validação de token.

## Sessão

`supabase-js` guarda a sessão (access + refresh token) em `localStorage`, renovação automática de token cuidada pela própria lib. `AuthContext` reage a `onAuthStateChange`; não há polling nem verificação manual de expiração no código da aplicação.

**Ponto já corrigido nesta auditoria (A7)**: `AuthContext.tsx`, no branch onde a sessão do Supabase não resolve um `userId` (`applySession`), setava `user` a partir de um objeto salvo em `sessionStorage` — que é gravável livremente pelo devtools do navegador (`sessionStorage.setItem('axis_user_session', '{"isMaster":true,...}')`), permitindo forjar uma sessão master sem nunca ter feito login. Hoje esse branch faz `setUser(null)` — a única fonte de verdade pra "quem está logado" é o JWT validado pelo próprio Supabase.

## Autenticação no backend (`server.ts`)

`requireUser` (middleware) — lê `Authorization: Bearer <jwt>`, chama `supabase.auth.getUser(token)` (valida a assinatura contra o Supabase, não decodifica localmente), e anexa:
- `req.user` — o usuário autenticado.
- `req.supabase` — um client novo, criado com o **mesmo token** do chamador (não a chave anônima nem a service_role). Toda query feita com `req.supabase` daqui pra frente já respeita a RLS da sessão automaticamente — é assim que a maioria das rotas de IA evita ter que filtrar `tenant_id` manualmente.

Sem token válido → `401`. Ver [AUTHORIZATION.md](AUTHORIZATION.md) para as camadas que vêm depois (API key, master).

## Conta master hardcoded (removida)

Existia uma função `setupMasterUser()` em `src/lib/supabase.ts` que criava/logava uma conta fixa (`admin@gthec.com` / senha hardcoded no bundle do cliente) com `is_master: true`, acionável por um botão em `AdminSaaS.tsx`. Essa conta é real e ativa no banco — **removida do código nesta auditoria** (função, import, estado e botão), mas a conta em si continua existindo no Supabase Auth. Ver [`SECURITY_AUDIT.md`](../SECURITY_AUDIT.md) (C1) — **requer ação manual**: trocar a senha dessa conta (ou desativá-la) diretamente no painel do Supabase Auth; o código não pode fazer isso por você.

## Auto-registro (`/register`)

Existia uma rota `/register` com formulário de auto-cadastro (`registerPartner()`), sem gate de convite nem verificação de e-mail — qualquer visitante podia criar uma conta. Página e função removidas (zero lugares no código as importavam de qualquer forma útil). Criação de usuário hoje só acontece via `POST /api/admin/tenant` (novo tenant, `requireMaster`) ou pela tela de RH de cada tenant (`NovoMembroModal.tsx`, gate de papel — ver [AUTHORIZATION.md](AUTHORIZATION.md#criação-de-usuários)).
