# Guia de Testes para FormSheetWithZod

Este guia demonstra como testar componentes que usam `FormSheetWithZod`.

## Estrutura Básica de Testes

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

## Exemplo 1: Testando Validação

```typescript
describe('NovoContatoSheet', () => {
  it('deve exibir erros de validação quando campos são inválidos', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <NovoContatoSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
      { wrapper: createWrapper() }
    );

    // Tentar submeter sem preencher
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);

    // Verificar mensagens de erro
    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });

    // Verificar que onSubmit não foi chamado
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter dados válidos', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <NovoContatoSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
      { wrapper: createWrapper() }
    );

    // Preencher campos
    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@exemplo.com');
    await user.type(screen.getByLabelText(/mensagem/i), 'Olá, gostaria de mais informações');

    // Submeter
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    // Verificar que foi chamado com dados corretos
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        mensagem: 'Olá, gostaria de mais informações',
      });
    });
  });
});
```

## Exemplo 2: Testando Campos Dependentes

```typescript
describe('ConfiguracaoClienteSheet', () => {
  it('deve alterar label do documento baseado no tipo', async () => {
    const user = userEvent.setup();

    render(
      <ConfiguracaoClienteSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Inicialmente deve mostrar CPF
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();

    // Mudar para empresa
    const tipoSelect = screen.getByLabelText(/tipo de cliente/i);
    await user.click(tipoSelect);
    await user.click(screen.getByRole('option', { name: /empresa/i }));

    // Agora deve mostrar CNPJ
    await waitFor(() => {
      expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
    });
  });
});
```

## Exemplo 3: Testando DatePicker

```typescript
describe('AgendamentoSheet', () => {
  it('deve permitir selecionar uma data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AgendamentoSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
      { wrapper: createWrapper() }
    );

    // Abrir calendário
    const dateButton = screen.getByRole('button', { name: /selecione uma data/i });
    await user.click(dateButton);

    // Selecionar uma data (assumindo que o calendário está visível)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateCell = screen.getByRole('button', { 
      name: tomorrow.getDate().toString() 
    });
    await user.click(dateCell);

    // Verificar que a data foi selecionada
    await waitFor(() => {
      expect(screen.getByText(format(tomorrow, 'PPP'))).toBeInTheDocument();
    });
  });
});
```

## Exemplo 4: Testando Loading State

```typescript
describe('NovoClienteSheet', () => {
  it('deve desabilitar botões durante loading', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <NovoClienteSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
      { wrapper: createWrapper() }
    );

    // Preencher campos
    await user.type(screen.getByLabelText(/nome/i), 'João Silva');
    // ... preencher outros campos

    // Submeter
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);

    // Verificar que botões estão desabilitados
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });

    // Verificar que mostra loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## Exemplo 5: Testando Reset ao Fechar

```typescript
describe('FormSheetWithZod', () => {
  it('deve resetar formulário ao fechar', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <MeuFormSheet
        open={true}
        onOpenChange={onOpenChange}
      />,
      { wrapper: createWrapper() }
    );

    // Preencher campo
    await user.type(screen.getByLabelText(/nome/i), 'João Silva');

    // Verificar valor
    expect(screen.getByLabelText(/nome/i)).toHaveValue('João Silva');

    // Fechar
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Reabrir
    rerender(
      <MeuFormSheet
        open={false}
        onOpenChange={onOpenChange}
      />
    );

    rerender(
      <MeuFormSheet
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // Verificar que foi resetado
    await waitFor(() => {
      expect(screen.getByLabelText(/nome/i)).toHaveValue('');
    });
  });
});
```

## Exemplo 6: Testando Múltiplos Selects

```typescript
describe('FormularioComMultiplosSelects', () => {
  it('deve permitir selecionar múltiplas categorias', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PreferenciasSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={onSubmit}
      />,
      { wrapper: createWrapper() }
    );

    // Marcar múltiplas checkboxes
    await user.click(screen.getByLabelText(/eventos/i));
    await user.click(screen.getByLabelText(/estoque/i));
    await user.click(screen.getByLabelText(/financeiro/i));

    // Submeter
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Verificar que todas foram selecionadas
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          categorias: expect.arrayContaining(['eventos', 'estoque', 'financeiro']),
        })
      );
    });
  });
});
```

## Mocking de Hooks

```typescript
// Mock do useEstoque
vi.mock('@/hooks/estoque', () => ({
  useEstoque: () => ({
    adicionarMaterial: {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    },
  }),
}));

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));
```

## Utilitários de Teste

```typescript
// Helper para preencher formulário
export const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  fields: Record<string, string>
) => {
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(new RegExp(label, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
};

// Uso
await fillForm(user, {
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  telefone: '11999999999',
});
```

## Boas Práticas

1. **Sempre use `waitFor`** para operações assíncronas
2. **Use `userEvent` ao invés de `fireEvent`** para simular interações reais
3. **Teste mensagens de validação** específicas do Zod
4. **Verifique estados de loading** e disabled
5. **Teste casos de erro** além dos casos de sucesso
6. **Use mocks para hooks externos** (API calls, etc.)
7. **Teste acessibilidade** com queries por role e label
8. **Verifique reset de formulário** ao fechar/reabrir

## Coverage Checklist

Para cada FormSheetWithZod, teste:
- ✅ Validação de campos obrigatórios
- ✅ Validação de formato (email, telefone, etc.)
- ✅ Submissão com dados válidos
- ✅ Mensagens de erro customizadas
- ✅ Loading states
- ✅ Reset ao fechar
- ✅ Campos condicionais
- ✅ Integração com hooks externos
- ✅ Tratamento de erros da API
