

# Reorganizacao do Sidebar - Lista Plana com Configuracoes Expansivel

## Objetivo
Remover os agrupamentos (Menu Principal, Pessoas, Operacional, Gestao) e criar uma lista plana de itens. O item "Configuracoes" tera sub-itens expansiveis: Geral, Equipe e Performance.

## Mudancas

### 1. Reestruturar `AppSidebar.tsx`

**Remover**: Sistema de grupos (`MenuGroup[]`, `SidebarGroupLabel`)

**Nova estrutura de menu** - lista plana na ordem solicitada:
1. Dashboard (`/dashboard`) - Home
2. Eventos (`/eventos`) - Calendar
3. Clientes (`/clientes`) - Users
4. Financeiro (`/financeiro`) - DollarSign
5. Demandas (`/demandas`) - ClipboardList
6. Base de Conhecimento (`/base-conhecimento`) - BookOpen
7. Estoque (`/estoque`) - Package
8. Transportadoras (`/transportadoras`) - Truck
9. Relatorios (`/relatorios`) - BarChart3
10. Configuracoes (expansivel com Collapsible) - Settings
    - Geral (`/configuracoes`) - Settings
    - Equipe (`/equipe`) - UserCog
    - Performance (`/performance`) - Activity

**Implementacao tecnica**:
- Usar `Collapsible` do Radix para o sub-menu de Configuracoes
- O Collapsible abre automaticamente quando a rota ativa e `/configuracoes`, `/equipe` ou `/performance`
- Manter toda a logica de permissoes (`canSeeItem`) existente
- Configuracoes visivel apenas para admin (ja e assim)
- Equipe continua com checagem `equipe.visualizar` / `equipe.editar`
- Performance continua restrito a admin

### 2. Atualizar permissoes no `canSeeItem`

- Adicionar caso `'Configurações'` retornando `true` se o usuario pode ver pelo menos um dos sub-itens (Geral para admin, Equipe para quem tem permissao, Performance para admin)
- Manter a logica existente para cada sub-item

### 3. Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/layout/AppSidebar.tsx` | Reestruturar menu: lista plana + Collapsible para Configuracoes |

Nenhuma rota precisa mudar - `/equipe`, `/performance` e `/configuracoes` continuam funcionando normalmente. A mudanca e puramente visual/navegacional no sidebar.

