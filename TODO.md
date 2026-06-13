# TODO (Refactor por Blocos: páginas e modais)

## Etapa 1 — Padronização
- [ ] Definir padrão de pastas: **página/modal -> componentes por blocos**
  - Regra: mover lógica/JSX “coesa” para `components/<PáginaOuModal>/{Bloco...}`.
  - Regra: arquivos pequenos e reutilizáveis (1 responsabilidade por bloco).
  - Regra adicional: preferir **props explícitas** no bloco (sem depender de variáveis do componente pai).
- [ ] Documentar convenções de nomes (Header, Tabs, TabContent, Footer, etc.)
  - Sufixos sugeridos: `Header.tsx`, `Tabs.tsx`, `TabContent.tsx`, `Footer.tsx`, `List.tsx`, `CardGrid.tsx`, `Actions.tsx`.
  - Para hooks internos: `use<Bloco>.ts` ou `use<Page>.ts`.
  - Para constantes/helpers do bloco: `<Bloco>.constants.ts` / `<Bloco>.helpers.ts`.

> Critério de refatoração: manter comportamento e props/contratos existentes. Evitar mudanças funcionais durante quebra em blocos.

## Etapa 1.1 — Modelo de divisão (checklist por arquivo novo)
- [ ] Exportar **um** componente/bloco por arquivo (salvo `index.ts`).
- [ ] Se houver estado local, ele deve ficar no componente/bloco mais próximo do responsável.
- [ ] Evitar “prop drilling” excessivo: se passar muitos props, provavelmente é melhor criar um `use<Bloco>()`.
- [ ] Manter imports locais (relativos) e consistentes com o padrão do diretório.


## Etapa 2 — Começar pelos alvos principais (por lotes)

### Lote 2.1 — Modal
- [x] Refatorar `src/components/ui/LeadDetailsModal.tsx` quebrando em blocos (header/tabbar/tabcontent/footer)
- [x] Atualizar/criar módulos: `src/components/ui/lead-details/*`
- [x] Rodar checagem (build/typecheck) após a refatoração do modal

### Lote 2.2 — Dashboard / PerformanceIA
- [x] Refatorar `src/pages/dashboard/PerformanceIA.tsx` quebrando blocos (engine cards + simulador/recomendações)
- [x] Criar componentes em `src/pages/dashboard/components/PerformanceIA/*`
- [x] Rodar checagem (build/typecheck) após a refatoração da página

### Lote 2.3 — Dashboard principal
- [x] Refatorar `src/pages/dashboard/Dashboard.tsx` quebrando blocos
  - Separar blocos em componentes (por exemplo):
    - `DashboardStatsSection` (QuickStatsGrid)
    - (extração da lógica) `DashboardStatsByNiche`
- [x] Rodar checagem (build/typecheck) após a refatoração da página
- [x] (Concluir lote) Garantir que o arquivo final continua abaixo de ~500 linhas



## Etapa 3 — Aplicar em todo o sistema (ordem por pastas)
- [ ] `src/pages/dashboard/**`
  - [ ] Quebrar componentes em blocos para as páginas restantes dentro de `dashboard/`.
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
  - [ ] Estratégia: tratar primeiro modais mais complexos (múltiplas seções/tabs/steps).
  - [ ] Aplicar o mesmo padrão de `blocks` do `LeadDetailsModal`.


## Etapa 4 — Consolidação
- [ ] Verificar duplicação de componentes e mover para `src/components/*` quando fizer sentido
  - Ex.: botões/chips/cards e padrões repetidos entre páginas.
- [ ] Garantir que nenhum arquivo excedeu ~500 linhas após as mudanças
  - Usar regra prática: se houver mais de ~250-300 linhas de JSX/condições, quebrar em blocos.
- [ ] Padronizar imports e exports (evitar imports “profundos” desnecessários)
  - Preferir `components/<...>/index.ts` quando houver muitos blocos no mesmo diretório.
- [ ] Rodar build final e revisar erros
  - Verificar `typecheck` / `lint` e corrigir warnings reais.

## Definition of Done (DoD)
- [ ] Todas as páginas/refactors concluídos mantém comportamento idêntico.
- [ ] Build/typecheck passa.
- [ ] Onde houver refactor, pelo menos 1 commit por lote (ex.: Dashboard vs Modal).


