

## Reorganizar Sidebar com Sub-menus

### Estrutura Proposta

Dashboard e Eventos permanecem no grupo "Menu Principal" (sem mudanca). Os demais itens sao distribuidos em 3 novos grupos tematicos:

```text
+-----------------------------------+
|  [T] Ticket Up                    |
|      Nome do usuario              |
+-----------------------------------+
|                                   |
|  MENU PRINCIPAL                   |
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

1. **Reestruturar dados do menu** - Substituir o array plano `menuItems` por um array de grupos:

```typescript
const menuGroups = [
  {
    label: 'Menu Principal',
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

2. **Renderizar multiplos SidebarGroup** - Cada grupo vira um `SidebarGroup` com seu `SidebarGroupLabel`. Todos ficam sempre expandidos (separacao visual, sem collapse).

3. **Manter logica de permissoes** - A filtragem por permissoes continua identica, aplicada por item dentro de cada grupo. Grupos que ficam vazios apos filtragem sao ocultados automaticamente.

4. **Sidebar colapsado** - Labels de grupo desaparecem, apenas icones com tooltips. Comportamento nativo do componente.

### Resumo

| Acao | Detalhe |
|---|---|
| Alterar `AppSidebar.tsx` | Reorganizar de lista plana para 4 grupos (Menu Principal + 3 tematicos) |
| Sem novas dependencias | Usa componentes Sidebar ja existentes |
| Sem mudanca de rotas | URLs e permissoes identicas |
| Sem migracoes SQL | Nenhuma alteracao no banco |

