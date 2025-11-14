# InfoGrid Component

Componente reutilizável para exibir informações em layout grid padronizado, garantindo consistência visual em todo o sistema.

## Variantes

### InfoGrid (Principal)
Layout grid com 1, 2 ou 3 colunas, ideal para cards e seções de detalhes.

### InfoGridCompact
Layout flexível compacto, ideal para informações secundárias em cards pequenos.

## Uso Básico

```tsx
import { InfoGrid } from '@/components/shared/InfoGrid';
import { Calendar, MapPin, User } from 'lucide-react';

// Grid com 2 colunas (padrão)
<InfoGrid
  items={[
    {
      icon: Calendar,
      label: 'Data',
      value: '15/01/2024',
    },
    {
      icon: MapPin,
      label: 'Local',
      value: 'São Paulo, SP',
    },
    {
      icon: User,
      label: 'Responsável',
      value: 'João Silva',
      fullWidth: true, // Ocupa toda a largura
    },
  ]}
/>
```

## Propriedades

### InfoGrid

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| items | InfoGridItemProps[] | - | Array de itens a serem exibidos |
| columns | 1 \| 2 \| 3 | 2 | Número de colunas do grid |
| gap | 'sm' \| 'md' \| 'lg' | 'md' | Espaçamento entre items |
| className | string | - | Classes CSS adicionais |

### InfoGridItemProps

| Prop | Tipo | Descrição |
|------|------|-----------|
| icon | LucideIcon | Ícone do item (opcional) |
| label | string | Label do item |
| value | ReactNode | Valor a ser exibido |
| className | string | Classes CSS adicionais para o item |
| iconClassName | string | Classes CSS para o ícone |
| labelClassName | string | Classes CSS para o label |
| valueClassName | string | Classes CSS para o valor |
| fullWidth | boolean | Se true, item ocupa toda a largura (col-span-2) |

## Exemplos

### Grid com 3 colunas
```tsx
<InfoGrid
  columns={3}
  gap="lg"
  items={[
    { icon: User, label: 'Nome', value: 'Maria Santos' },
    { icon: Mail, label: 'Email', value: 'maria@email.com' },
    { icon: Phone, label: 'Telefone', value: '(11) 98765-4321' },
  ]}
/>
```

### InfoGridCompact para informações secundárias
```tsx
import { InfoGridCompact } from '@/components/shared/InfoGrid';
import { Phone, Mail, Star } from 'lucide-react';

<InfoGridCompact
  items={[
    {
      icon: Phone,
      value: '(11) 98765-4321',
    },
    {
      icon: Mail,
      value: 'contato@empresa.com',
      className: 'max-w-[200px]',
      valueClassName: 'truncate',
    },
    {
      icon: Star,
      value: '4.8',
      iconClassName: 'fill-yellow-400 text-yellow-400',
      valueClassName: 'font-medium',
    },
  ]}
/>
```

### Com valores customizados
```tsx
<InfoGrid
  items={[
    {
      icon: DollarSign,
      label: 'Valor',
      value: 'R$ 1.500,00',
      valueClassName: 'font-semibold text-green-600',
    },
    {
      icon: Calendar,
      label: 'Status',
      value: <Badge variant="default">Ativo</Badge>,
    },
  ]}
/>
```

## Quando Usar

### Use InfoGrid quando:
- Precisa exibir múltiplos campos de informação em um layout organizado
- Quer garantir consistência visual entre diferentes cards
- Necessita de um layout responsivo com 2-3 colunas

### Use InfoGridCompact quando:
- Precisa exibir informações secundárias em uma linha compacta
- Quer economizar espaço vertical em cards pequenos
- Está criando um footer ou seção de metadados em um card

## Padrão de Espaçamento

- **small**: gap-x-2 gap-y-1.5 (8px horizontal, 6px vertical)
- **medium**: gap-x-3 gap-y-2 (12px horizontal, 8px vertical) - **padrão**
- **large**: gap-x-4 gap-y-2.5 (16px horizontal, 10px vertical)

## Acessibilidade

- Ícones possuem classe `shrink-0` para evitar distorção
- Text truncation com classe `truncate` quando necessário
- Cores semânticas usando tokens do design system
