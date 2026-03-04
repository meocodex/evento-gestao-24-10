

# Fix: Validacao do CPF do Responsavel Legal no Step 3

## Problema

O formulario permite avancar do Step 3 (Produtor) com um CPF do responsavel legal incompleto ou invalido. A validacao so e feita no momento do submit final (Step 6), gerando frustacao porque o usuario ja preencheu todos os outros passos.

**Causa raiz**: A condicao `disabled` do botao "Proximo" no Step 3 (linha 1168) apenas verifica se `responsavelCpf` e truthy (`!responsavelCpf`), mas nao valida se e um CPF valido com 11 digitos. Entao o usuario pode digitar "123.456.7" e avancar normalmente, so recebendo o erro ao final.

## Correcao

### Arquivo: `src/pages/public/CadastroEvento.tsx`

Alterar a validacao do botao "Proximo" no Step 3 para incluir validacao real do CPF do responsavel legal:

```typescript
// De:
(produtorTipo === 'CNPJ' && (!responsavelNome || !responsavelCpf || !responsavelDataNascimento))

// Para:
(produtorTipo === 'CNPJ' && (
  !responsavelNome || 
  !responsavelCpf || 
  !validarCPF(responsavelCpf.replace(/\D/g, '')) ||
  !responsavelDataNascimento
))
```

Isso bloqueia o avanco no Step 3 ate que o CPF do responsavel legal seja valido, evitando que o erro so apareca no final do cadastro.

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/public/CadastroEvento.tsx` | Adicionar `validarCPF()` na condicao disabled do botao Proximo do Step 3 |

