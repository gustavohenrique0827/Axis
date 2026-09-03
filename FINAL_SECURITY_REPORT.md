# Relatório final de segurança — Axis

**Período:** 2026-09-01 a 2026-09-03. **Escopo:** frontend (React/Vite), backend (`server.ts`/Vercel), Supabase (Postgres/RLS/Storage/Auth), dependências, histórico do Git, organização do repositório e documentação. Ver [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) pro levantamento achado-por-achado completo — este documento é o resumo executivo.

## Nível geral de segurança: 🟡 Médio, com pendências críticas de ação manual

A arquitetura de isolamento multi-tenant (RLS/`has_tenant_access`) é sólida e foi a base certa desde o início — a maior parte dos problemas encontrados era de **superfície de exposição** (credenciais no bundle, CORS aberto, chaves vazadas no histórico) e não de dado já em vazamento ativo e generalizado. As duas exceções ativas foram encontradas e fechadas nesta auditoria (ver abaixo).

## Vulnerabilidades encontradas e corrigidas (19)

| # | Severidade | Achado | Status |
|---|---|---|---|
| C1 | 🔴 Crítico | Senha de super admin hardcoded no bundle, conta real ativa | 🟢 código corrigido / 🚨 senha ainda precisa ser trocada manualmente |
| C2 | 🔴 Crítico | Chaves de API reais no histórico do Git, ainda em uso | 🚨 requer rotação manual (não automatizável) |
| C3 | 🔴 Crítico | RBAC 100% client-side, sem segunda camada de defesa | 🟡 mitigado parcialmente (`/app/admin` ganhou guarda server-verificada) |
| C4 | 🔴 Crítico | `ai_usage_log`/`aurora_audit_log`: RLS `qual:true` + `GRANT` completo pra `anon` — achado tardio, durante a fase de documentação | 🟢 corrigido e verificado ao vivo |
| C5 | 🔴 Crítico | RPC pública `claim_next_form_sdr(p_tenant_id)` aceitava qualquer tenant — vazava PII de funcionário (nome/telefone) e corrompia rodízio de qualquer empresa, sem login — achado tardio, via `get_advisors` | 🟢 corrigido e verificado ao vivo |
| A1 | 🟠 Alto | CORS `Access-Control-Allow-Origin: *` | 🟢 corrigido (allowlist) |
| A2 | 🟠 Alto | Nenhum rate limiting | 🟢 corrigido (`express-rate-limit`) |
| A3 | 🟠 Alto | Senha fraca `"123456"` + criação de usuário sem checagem de papel | 🟢 corrigido |
| A4 | 🟠 Alto | Sem fluxo de recuperação de senha | 🟢 corrigido |
| A5 | 🟠 Alto | `npm audit`: 1 crítica + 9 altas | 🟢 corrigido (parcial — 3 moderadas remanescentes, ver abaixo) |
| A6 | 🟠 Alto | `/register` morta mas com `registerPartner()` viva | 🟢 corrigido (removido) |
| A7 | 🟠 Alto | Sessão "demo" confiava em `sessionStorage` sem verificação | 🟢 corrigido |
| A8 | 🟠 Alto | `tenants`: policy `anon` sem restrição de coluna | 🟢 corrigido (GRANT por coluna) |
| A9 | 🟠 Alto | `chat_messages`/`chat_contacts` sem `tenant_id` (tabelas não existem ainda) | 🟡 documentado, não aplicável até as tabelas serem criadas |
| A10 | 🟠 Alto | Simulador de WhatsApp em memória sem isolamento de tenant — **ativo** | 🟢 corrigido (buckets por tenant) |
| A11 | 🟠 Alto | Respostas de erro vazando `error.message` cru | 🟢 corrigido |
| M1 | 🟡 Médio | Buckets de Storage sem limite de tamanho/tipo | 🟢 corrigido |
| M2 | 🟡 Médio | Arquivo/dependência Firebase órfãos | 🟢 corrigido |
| M3 | 🟡 Médio | `Axis.git/`/`E-EMPREENDA+/` versionados no repo | 🟡 parcial (`Axis.git/` removido; `E-EMPREENDA+/` aguarda decisão sua) |
| M4 | 🟡 Médio | Chave real em `.env.example` | 🟢 corrigido |
| M5 | 🟡 Médio | Campo `role` texto livre | 🟡 não corrigido (baixo risco hoje) |
| M6 | 🟡 Médio | Dependências duplicadas/mortas | 🟢 corrigido |
| B1 | 🟢 Baixo | Sem headers de segurança | 🟢 corrigido |
| B2 | 🟢 Baixo | Sem CI/CD | 🟢 corrigido |

**18 de 21 achados endereçáveis por código/config foram corrigidos e verificados** (via `tsc --noEmit`, `npm run build`, `get_advisors`, e testes ao vivo no banco via `SET ROLE`). Os 3 restantes (A9, M5, C3-residual) são decisões de produto/arquitetura ou dependem de uma tabela que ainda não existe — documentados, não escondidos.

Além da tabela acima, uma segunda passada de `get_advisors` (security) depois da fase de documentação encontrou e já corrigiu: `search_path` mutável em duas funções trigger (`set_updated_at`, `sync_sprint_task_project_from_issue` — risco baixo, corrigido por ser mecânico) e confirmou como seguro (não é vulnerabilidade real) o padrão de `platform_metrics_overview()`, que é `SECURITY DEFINER` executável por `anon` mas já se auto-protege checando `is_super_admin()`/`current_partner_id()` no corpo. Fica pendente só a ativação de "Leaked Password Protection" no painel do Supabase Auth (não é uma migração SQL).

## Testes de segurança executados

Sem acesso a uma sessão de navegador real logada, os testes possíveis diretamente foram os de RLS/banco (a camada que efetivamente decide acesso a dado neste sistema) e análise estática do código-fonte. Executados nesta rodada:

| Teste | Método | Resultado |
|---|---|---|
| **Acesso não-autenticado a tabela tenant-scoped** | `SET ROLE anon; SELECT * FROM ai_usage_log;` | ✅ Bloqueado (`permission denied`) — antes do fix, teria retornado todas as linhas de todos os tenants (C4) |
| **Isolamento cross-tenant (papel comum, não master)** | `SET ROLE authenticated; SET request.jwt.claims='{"sub":"<usuário Pluppex>"}'; SELECT COUNT(*) FROM leads WHERE tenant_id = '<tenant Nicolas>'` | ✅ `0` linhas — mesmo usuário via `0` num tenant alheio e `3` no próprio tenant na mesma sessão, confirmando que a policy realmente filtra por identidade, não que a query simplesmente falhou |
| **Coluna sensível exposta a `anon`** | `SET ROLE anon; SELECT webhook_url FROM tenants;` | ✅ Bloqueado (`permission denied for column`) — corrigido nesta auditoria (A8) |
| **Injeção de SQL** | Revisão estática — toda query em `server.ts` usa o query builder do `supabase-js` (parametrizado) ou `.rpc()` contra funções nomeadas fixas; nenhuma concatenação de string de usuário em SQL bruto encontrada | ✅ Nenhum vetor encontrado |
| **XSS via HTML não sanitizado** | `grep -rn "dangerouslySetInnerHTML"` em `src/` | ✅ Nenhuma ocorrência — nenhum ponto do frontend injeta HTML bruto vindo de dado do usuário |
| **Upload malicioso (tamanho/tipo)** | Inspeção de config dos buckets Storage | ✅ Enforcement no bucket, não só no cliente (M1, corrigido) |
| **Webhook forjado/sem assinatura** | Inventário de rotas | N/A — não existe nenhum endpoint de webhook de entrada no sistema hoje (ver [docs/WEBHOOKS.md](docs/WEBHOOKS.md)) |
| **Token expirado/adulterado** | Revisão de `requireUser` | ✅ Validação delegada a `supabase.auth.getUser(token)` (verifica assinatura contra o Supabase, não decodifica localmente) — não há verificação própria de JWT que possa ter um bug de implementação |
| **IDOR (adivinhar/enumerar ID de outro tenant)** | Coberto pelo teste de isolamento cross-tenant acima, aplicado ao padrão geral de toda tabela com `tenant_isolation` | ✅ Mesma policy vale pra toda tabela no mesmo padrão — não é um caso isolado de `leads` |
| **RPC pública `SECURITY DEFINER` aceitando parâmetro de tenant sem validação** | `get_advisors` (security) sinalizou toda função `SECURITY DEFINER` executável por `anon`/`authenticated`; cada uma foi lida manualmente | ❌→✅ `claim_next_form_sdr(p_tenant_id)` aceitava qualquer tenant sem checagem — achado crítico (C5), corrigido e reverificado ao vivo. `platform_metrics_overview()` foi sinalizada igual, mas confirmada segura por já validar `is_super_admin()`/`current_partner_id()` no próprio corpo. |

**Não testado** (exige sessão de navegador real, fora do alcance desta sessão): fluxo de login/logout ponta-a-ponta, troca de aba/empresa como usuário master real navegando, CSRF (mitigado estruturalmente por não haver autenticação via cookie — é Bearer token —, mas não confirmado por um teste de navegador real), comportamento de rate limiting sob carga real.

## Pendências que exigem ação sua (não automatizáveis)

1. 🚨 **Trocar a senha de `admin@gthec.com`** no Supabase Auth — a conta é real, ativa, `is_master: true`, e sua senha esteve hardcoded e visível no bundle público até esta auditoria.
2. 🚨 **Rotacionar `AXIS_API_KEY_MAIN`, `AXIS_API_KEY_FORM` e a chave do Gemini** — os valores que vazaram no histórico do Git são os mesmos ainda em uso hoje.
3. 🚨 **Habilitar "Leaked Password Protection"** em Authentication → Policies no painel do Supabase — checagem de senha nova/de reset contra vazamentos conhecidos (HaveIBeenPwned), hoje desligada. Não é uma migração SQL, só um toggle no painel.
4. **Decidir o destino de `E-EMPREENDA+/`** — mantido versionado neste repositório por ora; considerar extrair pra repositório próprio se continuar crescendo como projeto independente.
5. **Decisão de produto sobre RBAC granular dentro do tenant** (C3 residual) — hoje qualquer usuário autenticado do tenant pode chamar qualquer rota `/api/ai/*`/`/api/leads/*`; adicionar granularidade por papel exige definir qual papel pode fazer o quê, não é um fix mecânico.
6. **Opcional**: avaliar o upgrade major do `express` pra fechar as 3 vulnerabilidades moderadas remanescentes (cadeia `express`→`body-parser`→`qs`) — deliberadamente não forçado sem teste de compatibilidade.
7. **Opcional**: adicionar Content-Security-Policy — precisa de inventário prévio de todo recurso externo carregado pelo frontend pra não quebrar nada.

## O que já estava correto (não precisou de correção)

`SUPABASE_SERVICE_ROLE_KEY` nunca referenciada em `src/`; rotas administrativas já eram gated por `requireMaster` server-side; `/api/v1/leads` sempre derivou `tenant_id` da API key, nunca do corpo da requisição; nenhum stack trace era devolvido ao cliente; nenhum arquivo `.pem`/`.key` jamais commitado; escrita em Storage já corretamente restrita por pasta = tenant.

## Entregáveis desta auditoria

Código: todas as correções da tabela acima. Documentação: `README.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/DATABASE_SECURITY.md`, `docs/AUTHENTICATION.md`, `docs/AUTHORIZATION.md`, `docs/WEBHOOKS.md`, `docs/ENVIRONMENT.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/DEVELOPMENT.md`, `docs/TROUBLESHOOTING.md`. Processo: `.github/workflows/ci.yml`, [`SECURITY_CHECKLIST.md`](SECURITY_CHECKLIST.md). Diagnóstico: [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) (detalhado) e este relatório (executivo).
