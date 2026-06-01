# Limpar Cache do localStorage

Como o localStorage ainda tinha dados antigos, siga um desses passos:

## Opção 1: Limpar via DevTools (Rápido)

1. Abra a app (localhost ou Vercel)
2. Aperte **F12** para abrir DevTools
3. Vá em **Storage** → **Local Storage**
4. Procure por: `axis_tenant_modules`
5. **Delete** esse item
6. **Aperte F5** para recarregar a página

A página vai carregar só com `G-Tech Master` e depois **buscar todos os tenants do Supabase**.

## Opção 2: Executar no Console (Mais rápido)

1. Abra DevTools (**F12**)
2. Vá em **Console**
3. Cole e execute esse comando:

```javascript
localStorage.removeItem('axis_tenant_modules');
localStorage.removeItem('axis_session');
window.location.reload();
```

## Opção 3: Forçar Rebuild no Vercel

Se você quer que TODOS os usuários vejam a mudança sem limpar localStorage:

1. Abra https://vercel.com → seu projeto **Axis**
2. Clique em **Deployments**
3. Clique no último deploy
4. Clique em **Redeploy**
5. Espere terminar

Isso força um rebuild completo sem cache.

---

## Verificar se Funcionou

Abra **DevTools** (F12) → **Console** e procure por:

```
✅ [AuthContext] 🔄 Carregando tenants do banco de dados (sempre)...
✅ [AuthContext] ✅ Tenants do banco carregados: ["SolarCorp Engenharia", "Clínica Vida", ...]
```

Se ver isso = **FUNCIONOU!** ✅

O dropdown agora só mostra tenants que estão na tabela `tenants` do Supabase com `status = 'Active'`.
