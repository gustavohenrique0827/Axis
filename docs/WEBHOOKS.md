# Webhooks

## Saída (o sistema chama webhooks externos)

### Aurora chat → n8n
`POST /api/ai/aurora-chat` (`server.ts`, `requireUser`) recebe a mensagem do usuário e repassa pro webhook do n8n configurado em `AURORA_WEBHOOK_URL` (variável só de servidor, nunca `VITE_`-prefixada). **A URL do webhook nunca chega ao navegador** — o frontend só fala com `/api/ai/aurora-chat`, e é o backend quem conhece e chama a URL real. Isso evita que a URL do n8n (que normalmente não tem autenticação própria forte) fique exposta no bundle do cliente.

### Rodízio de leads ("Julia") → n8n
Automação externa (n8n) que lê/escreve em `julia_interaction_log`/`julia_round_robin_state` usando `service_role` (não passa pelo `server.ts`, não é uma rota HTTP deste repo). RLS dessas tabelas não afeta `service_role` (que sempre ignora RLS) — o isolamento por tenant nelas existe pra proteger contra acesso via `anon`/`authenticated`, não contra a própria automação. Ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md).

### WhatsApp (simulador)
As instâncias simuladas de WhatsApp têm um campo `webhookUrl` (ex.: `https://axis-crm.cloud/api/webhooks/whatsapp`), mas isso é **dado de configuração simulado** — o simulador (`server.ts`, seção WhatsApp) não faz nenhuma chamada HTTP real de saída para essa URL hoje. Ver [API.md](API.md#whatsapp-simulador--requireuser).

## RPC pública chamada pelo formulário do E-EMPREENDA+

Não é um webhook (não é um evento assinado empurrado por outro sistema), mas é a mesma categoria de risco: `claim_next_form_sdr(p_tenant_id)` é uma função Postgres `SECURITY DEFINER` chamada **sem login** pelo formulário de inscrição do E-EMPREENDA+ (`supabase.rpc(...)`, role `anon`) pra escolher o próximo SDR no rodízio. Tinha o mesmo defeito que um webhook mal validado teria: aceitava `p_tenant_id` como veio do chamador, sem checar se fazia sentido pra quem estava chamando — corrigido nesta auditoria (C5, ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md#funções-security-definer-chamáveis-via-rpc-pública)) pra só aceitar o tenant fixo do próprio E-EMPREENDA+.

## Entrada (webhooks que chegam de fora)

**Não existe nenhuma rota HTTP neste repo que receba um webhook de fora** (não há `POST /api/webhooks/*` nem equivalente em `server.ts` ou nas Supabase Edge Functions). A única forma de escrita externa sem sessão de usuário é `POST /api/v1/leads`, que é uma API própria autenticada por `x-api-key` (ver [API.md](API.md#api-pública-por-chave)) — não um webhook no sentido de "outro sistema empurra um evento assinado pra cá".

Se um webhook de entrada for adicionado no futuro (ex.: confirmação de entrega do WhatsApp real, callback de um provedor de pagamento), o padrão mínimo a seguir, que hoje **não existe em lugar nenhum do código** e precisaria ser criado do zero:
- Verificar assinatura/segredo do provedor (HMAC ou similar) antes de processar qualquer payload — nunca confiar em "veio de tal IP" ou em um header arbitrário.
- Resolver o `tenant_id` a partir de algo que o provedor não pode forjar (ex.: um identificador de instância já cadastrado no seu banco), nunca aceitar um `tenant_id` solto no corpo da requisição.
- Rate limiting próprio (o mesmo `express-rate-limit` já usado nas outras rotas).
- Responder rápido (2xx) e processar assíncrono, se o provedor exigir isso pra não reenviar.

## Tabelas `webhooks` / `webhook_logs`

Existem no banco, com RLS (`tenant_isolation`/`has_tenant_access(tenant_id)`) já correta desde a criação — mas **nenhum código do repo (frontend ou `server.ts`) as lê ou escreve hoje**. Schema morto, sem risco de segurança (ao contrário do achado em `ai_usage_log`/`aurora_audit_log`, ver [DATABASE_SECURITY.md](DATABASE_SECURITY.md)), mas também sem função — provavelmente preparadas para uma feature de webhooks configuráveis por tenant que ainda não foi implementada na UI.
