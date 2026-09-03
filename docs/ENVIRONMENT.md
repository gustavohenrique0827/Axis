# Variáveis de ambiente

Referência: [`.env.example`](../.env.example). Copie pra `.env` e preencha com valores reais — **nunca commite o `.env`** (já está no `.gitignore`).

## Regra do Vite: `VITE_*` é público

Qualquer variável prefixada com `VITE_` é embutida em texto plano no bundle JS servido ao navegador — **não é segredo**, mesmo que pareça uma chave de API. Variável sem esse prefixo, se referenciada em código que roda no navegador, chega como `undefined` (Vite só expõe as `VITE_*` no `import.meta.env`). Isso não é um bug, é o funcionamento normal do Vite — mas define uma regra dura pro projeto: **nada que precise ficar secreto pode ter o prefixo `VITE_`**, e nada sem o prefixo pode ser usado esperando que funcione no navegador.

## Frontend (público, vai pro bundle)

| Variável | Uso |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase. Público por design — é a mesma URL que qualquer requisição do navegador precisa conhecer. |
| `VITE_SUPABASE_ANON_KEY` | Chave `anon` do Supabase. Público por design — a segurança real é a RLS no banco (ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md)), não o sigilo dessa chave. |
| `VITE_GEMINI_API_KEY` | Chamadas à API do Gemini feitas **direto do navegador** em alguns pontos do frontend. **Isso expõe a chave do Gemini no bundle** — qualquer pessoa pode extrair e usar por conta própria, gerando custo pro projeto. Documentado em [`SECURITY_AUDIT.md`](../SECURITY_AUDIT.md) — mover essas chamadas pro backend (que já tem `/api/ai/*` pra outros casos) eliminaria a exposição, mas não foi feito nesta rodada por exigir mapear todo ponto de uso no frontend antes de migrar sem quebrar. |
| `VITE_GROQ_API_KEY` | Mesmo caso do Gemini acima — chave da Groq também referenciada em código de navegador. |

## Backend (`server.ts` — nunca vai pro bundle)

| Variável | Uso |
|---|---|
| `GEMINI_API_KEY` / `GROQ_API_KEY` | Versões server-side das mesmas chaves, usadas pelas rotas `/api/ai/*` — essas sim nunca chegam ao cliente. |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypassa RLS. Só usada nas 3 rotas `requireMaster` (`/api/admin/*`) e em `/api/v1/leads`. **Nunca** deve ganhar prefixo `VITE_` nem ser lida em código de `src/`. |
| `AXIS_API_KEYS` | Lista `chave:tenantId,chave:tenantId` — é isso que `requireApiKey` (`server.ts`) de fato lê para resolver o tenant de uma chamada a `/api/v1/leads`. `AXIS_API_KEY_MAIN`/`AXIS_API_KEY_FORM`/`AXIS_FORM_TENANT_ID`/`AXIS_FORM_CLIENT_ID` no `.env.example` são só rótulos de referência pra montar essa lista — nenhum código lê essas quatro variáveis individualmente. |
| `AXIS_CORS_ORIGIN` | Lista de origens permitidas, separadas por vírgula. Sem essa variável, nenhuma origem é liberada. **Nunca usar `"*"` em produção** — corrigido nesta auditoria (A1): antes, o valor default quando a variável não existia era `"*"`. |
| `AURORA_WEBHOOK_URL` | URL do webhook n8n da Aurora. Só o backend a conhece — ver [WEBHOOKS.md](WEBHOOKS.md#aurora-chat--n8n). |

## Achado desta auditoria: chaves reais no histórico do git

`AXIS_API_KEY_MAIN`, `AXIS_API_KEY_FORM` e a chave do Gemini foram commitadas com valor real em algum ponto do histórico do repositório, e **continuam sendo os valores em uso hoje** (confirmado comparando com o `.env` local). Isso significa que qualquer pessoa com acesso ao histórico do git (não só ao código atual) tem essas chaves. `.env.example` foi corrigido pra usar placeholders — mas **isso não invalida as chaves já expostas**. 🚨 Ação manual necessária, não automatizável por aqui: rotacionar (gerar novas) `AXIS_API_KEY_MAIN`/`AXIS_API_KEY_FORM`/a chave do Gemini, atualizar `.env` de produção com os novos valores. Reescrever o histórico do git (`git filter-repo` ou similar) é opcional e disruptivo — só vale a pena se o repositório já foi clonado por alguém fora da equipe; rotacionar a chave em si já neutraliza o vazamento independente disso.
