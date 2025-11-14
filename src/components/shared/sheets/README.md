# Sheet Components

Este diretório contém componentes reutilizáveis para criar sheets (painéis laterais) na aplicação.

## Componentes Disponíveis

### 1. BaseSheet
Componente base para criar sheets customizados.

**Quando usar:** Quando você precisa de controle total sobre o conteúdo do sheet.

```tsx
import { BaseSheet } from '@/components/shared/sheets';

<BaseSheet
  open={open}
  onOpenChange={setOpen}
  title="Título"
  description="Descrição"
  size="lg"
>
  {/* Seu conteúdo customizado aqui */}
</BaseSheet>
```

### 2. FormSheet
Componente para criar formulários sem integração automática com react-hook-form.

**Quando usar:** Quando você já tem seu próprio gerenciamento de formulário ou precisa de controle manual.

```tsx
import { FormSheet } from '@/components/shared/sheets';

<FormSheet
  open={open}
  onOpenChange={setOpen}
  title="Editar Item"
  onSubmit={handleSubmit}
  isLoading={isLoading}
  submitText="Salvar"
>
  <Input {...register('nome')} />
  {/* Mais campos... */}
</FormSheet>
```

### 3. FormSheetWithZod (Recomendado)
Componente genérico que integra FormSheet + react-hook-form + zod automaticamente.

**Quando usar:** Para a maioria dos formulários. Reduz boilerplate e garante consistência.

**Vantagens:**
- ✅ Gerenciamento automático de formulário
- ✅ Validação integrada com Zod
- ✅ Type-safety completo
- ✅ Reset automático ao fechar
- ✅ Menos código duplicado

**Exemplo básico:**

```tsx
import { FormSheetWithZod } from '@/components/shared/sheets';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

function MeuComponente() {
  const handleSubmit = async (data: FormData) => {
    // Sua lógica de submissão
    await api.criar(data);
  };

  return (
    <FormSheetWithZod
      open={open}
      onOpenChange={setOpen}
      title="Novo Item"
      schema={schema}
      defaultValues={{ nome: '', email: '' }}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormSheetWithZod>
  );
}
```

**Exemplo com Select:**

```tsx
<FormSheetWithZod
  open={open}
  onOpenChange={setOpen}
  title="Configurar Status"
  schema={statusSchema}
  defaultValues={{ status: 'ativo' }}
  onSubmit={handleSubmit}
>
  {(form) => (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )}
</FormSheetWithZod>
```

**Exemplo com DatePicker:**

```tsx
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

<FormSheetWithZod
  open={open}
  onOpenChange={setOpen}
  title="Agendar"
  schema={agendamentoSchema}
  defaultValues={{ data: new Date() }}
  onSubmit={handleSubmit}
>
  {(form) => (
    <FormField
      control={form.control}
      name="data"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Data</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )}
</FormSheetWithZod>
```

### 4. DetailsSheet
Componente para exibir detalhes com abas.

**Quando usar:** Para visualização de dados com múltiplas seções.

```tsx
import { DetailsSheet } from '@/components/shared/sheets';

const tabs = [
  {
    id: 'dados',
    label: 'Dados',
    content: <DadosTab />
  },
  {
    id: 'historico',
    label: 'Histórico',
    content: <HistoricoTab />
  }
];

<DetailsSheet
  open={open}
  onOpenChange={setOpen}
  title="Detalhes do Item"
  tabs={tabs}
/>
```

## Hooks Auxiliares

### useSheetState
Hook para gerenciar o estado de abertura/fechamento de sheets.

```tsx
import { useSheetState } from '@/components/shared/sheets';

function MeuComponente() {
  const { open, setOpen, handleOpen, handleClose } = useSheetState();

  return (
    <>
      <Button onClick={handleOpen}>Abrir</Button>
      <FormSheetWithZod
        open={open}
        onOpenChange={setOpen}
        // ... resto das props
      />
    </>
  );
}
```

## Migração de Componentes Existentes

Para migrar um componente que usa `FormSheet` + `useForm` para `FormSheetWithZod`:

**Antes:**
```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { nome: '' }
});

<FormSheet
  onSubmit={form.handleSubmit(onSubmit)}
>
  <Form {...form}>
    <FormField control={form.control} ... />
  </Form>
</FormSheet>
```

**Depois:**
```tsx
<FormSheetWithZod
  schema={schema}
  defaultValues={{ nome: '' }}
  onSubmit={onSubmit}
>
  {(form) => (
    <FormField control={form.control} ... />
  )}
</FormSheetWithZod>
```

## Props Comuns

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| open | boolean | - | Controla se o sheet está aberto |
| onOpenChange | (open: boolean) => void | - | Callback quando o estado muda |
| title | string | - | Título do sheet |
| description | string | - | Descrição opcional |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'lg' | Tamanho do sheet |
| side | 'left' \| 'right' \| 'top' \| 'bottom' | 'right' | Lado de onde o sheet aparece |

## Tamanhos Disponíveis

- `sm`: 400px
- `md`: 540px
- `lg`: 640px (padrão)
- `xl`: 768px
- `full`: 100vw

## Boas Práticas

1. **Use FormSheetWithZod** para novos formulários
2. **Defina schemas Zod** em arquivos `src/lib/validations/`
3. **Mantenha defaultValues** sincronizados com o schema
4. **Use type inference** do Zod com `z.infer<typeof schema>`
5. **Trate erros** no `onSubmit` do componente pai
6. **Reset automático** já está incluído no FormSheetWithZod

## Exemplos Completos

Ver os seguintes arquivos para exemplos de implementação:
- `src/components/estoque/NovoSerialSheet.tsx`
- `src/components/equipe/operacional/NovoOperacionalSheet.tsx`
- `src/components/clientes/NovoClienteSheet.tsx`
