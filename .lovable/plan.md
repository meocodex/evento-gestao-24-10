

## Reorganizar Sidebar com Sub-menus

### Situacao Atual

O sidebar tem 11 itens em uma lista plana sob um unico grupo "Menu Principal". Com tantos itens, fica dificil localizar rapidamente o que se precisa, especialmente em telas menores.

### Nova Estrutura Proposta

Organizar os itens em 4 grupos logicos usando componentes Collapsible (ja disponivel no projeto):

```text
+-----------------------------------+
|  [T] Ticket Up                    |
|      Nome do usuario              |
+-----------------------------------+
|                                   |
|  GERAL                            |
|    > Dashboard                    |
|    > Eventos                      |
|                                   |
|  PESSOAS                          |
|    > Clientes                     |
|    > Equipe                       |
|    > Demandas                     |
|                                   |
|  OPERACIONAL                      |
|    > Estoque                      |
|    > Transportadoras              |
|                                   |
|  GESTAO                           |
|    > Financeiro                   |
|    > Relatorios                   |
|    > Performance      (admin)     |
|    > Configuracoes    (admin)     |
|                                   |
+-----------------------------------+
|  Perfil: Admin                    |
|  [Sair]                           |
+-----------------------------------+
```

### Detalhes Tecnicos

**Arquivo alterado:** `src/components/layout/AppSidebar.tsx`

1. **Reestruturar dados do menu** - Substituir o array plano `menuItems` por um array de grupos, cada um com label e array de itens:

```typescript
const menuGroups = [
  {
    label: 'Geral',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Eventos', url: '/eventos', icon: Calendar },
    ],
  },
  {
    label: 'Pessoas',
    items: [
      { title: 'Clientes', url: '/clientes', icon: Users },
      { title: 'Equipe', url: '/equipe', icon: UserCog },
      { title: 'Demandas', url: '/demandas', icon: ClipboardList },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { title: 'Estoque', url: '/estoque', icon: Package },
      { title: 'Transportadoras', url: '/transportadoras', icon: Truck },
    ],
  },
  {
    label: 'Gestao',
    items: [
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
      { title: 'Relatorios', url: '/relatorios', icon: BarChart3 },
      { title: 'Performance', url: '/performance', icon: Activity },
      { title: 'Configuracoes', url: '/configuracoes', icon: Settings },
    ],
  },
];
```

2. **Usar multiplos `SidebarGroup`** - Cada grupo renderiza um `SidebarGroup` com seu `SidebarGroupLabel`, mantendo os grupos sempre expandidos (sem collapse de grupo, apenas separacao visual). Isso mantem a navegacao rapida enquanto organiza visualmente.

3. **Manter logica de permissoes** - A filtragem por permissoes continua identica, aplicada dentro de cada grupo. Grupos que ficam vazios apos filtragem sao ocultados automaticamente.

4. **Sidebar colapsado** - Quando em modo colapsado (icones apenas), os labels dos grupos desaparecem e so os icones ficam visiveis com tooltips, comportamento ja nativo do componente.

5. **Sem mudancas em outros arquivos** - Nenhuma alteracao no `MainLayout.tsx`, rotas, ou componente `sidebar.tsx`.

### Resumo

| Acao | Detalhe |
|---|---|
| Alterar `AppSidebar.tsx` | Reorganizar de lista plana para 4 grupos tematicos |
| Sem novas dependencias | Usa apenas componentes Sidebar ja existentes |
| Sem mudanca de rotas | URLs e permissoes permanecem identicas |
| Sem migracoes SQL | Nenhuma alteracao no banco |

