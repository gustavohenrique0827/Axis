# TODO (Refactor por Blocos: páginas e modais)

## Etapa 1 — Padronização
- [ ] Definir padrão de pastas: página/modal -> componentes por blocos
- [ ] Documentar convenções de nomes (Header, Tabs, TabContent, Footer, etc.)

## Etapa 2 — Começar pelos alvos principais
- [x] Refatorar `src/components/ui/LeadDetailsModal.tsx` quebrando em blocos (header/tabbar/tabcontent/footer)
- [ ] Garantir que as imports/export continuam funcionando
- [x] Rodar checagem (build/typecheck) após a refatoração do modal (pendente até finalizar as edições)

- [ ] Refatorar `src/pages/dashboard/Dashboard.tsx` quebrando blocos (hero/KPIs/chart/hot-leads, etc.)
- [ ] Garantir que as imports/export continuam funcionando
- [ ] Rodar checagem (build/typecheck) após a refatoração da página

## Etapa 3 — Aplicar em todo o sistema (ordem por pastas)
- [ ] `src/pages/dashboard/**`
- [ ] `src/pages/crm/**`
- [ ] `src/pages/clinica/**`
- [ ] `src/pages/dev/**`
- [ ] `src/pages/education/**`
- [ ] `src/pages/finance/**`
- [ ] `src/pages/hr/**`
- [ ] `src/pages/landing/**`
- [ ] `src/pages/marketing/**`
- [ ] `src/pages/operative/**`
- [ ] `src/pages/settings/**`
- [ ] `src/pages/admin/**`
- [ ] `src/pages/auth/**`

- [ ] `src/components/ui/**` (modais) restantes

## Etapa 4 — Consolidação
- [ ] Verificar duplicação de componentes e mover para `src/components/*` quando fizer sentido
- [ ] Garantir que nenhum arquivo excedeu ~500 linhas após as mudanças
- [ ] Rodar build final e revisar erros

