# 🔍 Verificar se Dados estão Sendo Puxados do Banco

## 1️⃣ Abra o DevTools (F12)
- Vá para a aba **Console**

## 2️⃣ Procure por Mensagens de Debug
Você deve ver logs como:
```
[Supabase] ✅ Configurado e pronto para uso
[DataContext] 🔄 Iniciando carregamento de dados do Supabase...
[DataContext] Supabase reachable: true
[DataContext] 📊 Carregando tabelas...
[DataContext] ✅ Dados carregados: { leads: 5, tasks: 3, contracts: 2, products: 0 }
```

## 3️⃣ Se Não Estiver Vendo Dados

### ❌ Se vir: "Supabase não está acessível"
- [ ] Verifique `.env` tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- [ ] Reinicie o dev server (`npm run dev`)
- [ ] Verifique se o Supabase está online (projeto não pausado)

### ❌ Se vir: "row violates row-level security policy"
- [ ] Execute os comandos SQL em: `supabase-fix-rls.sql`
- [ ] Desabilite RLS ou crie políticas públicas

### ❌ Se vir: "{ leads: 0, tasks: 0, contracts: 0 }"
- [ ] As tabelas estão vazias (comportamento correto na primeira vez)
- [ ] Vá para o Dashboard e crie alguns registros
- [ ] Recarregue a página - deve aparecer agora

## 4️⃣ Estrutura de Logs Esperada

**Sequência Correta:**
1. `[Supabase] ✅ Configurado...`
2. `[DataContext] 🔄 Iniciando...`
3. `[DataContext] Supabase reachable: true`
4. `[DataContext] 📊 Carregando tabelas...`
5. `[DataContext] ✅ Dados carregados: {...}`

**Se Falhar no Passo 3 ou 4:**
- Supabase URL/KEY inválida
- Rede offline
- Projeto pausado

## 5️⃣ Para Adicionar Dados de Teste
1. Acesse `https://app.supabase.com`
2. Clique no seu projeto
3. Vá para **Table Editor**
4. Insira alguns registros em `leads`, `tasks`, `contracts`
5. Recarregue o app

---

**Cole aqui a mensagem de erro exata do Console para análise:**
