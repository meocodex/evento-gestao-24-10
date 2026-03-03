

# Busca de CEP no Cadastro Publico - Analise

## Resultado do teste

Testei o cadastro publico diretamente no preview (`/cadastro-evento`), digitei o CEP `78045-000` e a busca automatica **funcionou corretamente**:
- O endereço foi preenchido automaticamente (Avenida São Sebastião, Quilombo, Cuiabá, MT)
- O toast "CEP encontrado!" apareceu
- O spinner de loading apareceu durante a busca

## Possiveis causas do problema no seu lado

1. **Versao desatualizada**: Se voce esta acessando pela URL publicada (`evento-gestao-24-10.lovable.app`), pode estar em uma versao antiga. Publique novamente para garantir que o codigo mais recente esta no ar.

2. **Problema de rede**: A API ViaCEP (`viacep.com.br`) pode estar bloqueada ou lenta na sua rede. O debounce de 800ms espera antes de buscar.

3. **CEP invalido ou inexistente**: Se o CEP digitado nao existe na base do ViaCEP, a busca retorna `null` e nenhum feedback visual e dado (o codigo nao mostra toast de erro nesse caso - apenas quando ha excecao de rede).

## Melhoria sugerida

Adicionar feedback quando o CEP nao e encontrado (retorno `null` sem excecao). Atualmente, se `buscarEnderecoPorCEP` retorna `null`, nada acontece - o usuario fica sem saber o que houve.

### Mudanca em `CadastroEvento.tsx` (linha 259-268)

Apos o `if (endereco)`, adicionar um `else` com toast informativo:
```typescript
if (endereco) {
  // ... preenche campos (ja existe)
} else {
  toast({
    title: 'CEP não encontrado',
    description: 'Verifique o CEP digitado ou preencha o endereço manualmente.',
    variant: 'destructive',
  });
}
```

Essa mesma correcao deve ser aplicada tambem ao useEffect do CEP do produtor (linhas 236-243).

### Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/public/CadastroEvento.tsx` | Adicionar `else` com toast nos 2 useEffects de CEP |

