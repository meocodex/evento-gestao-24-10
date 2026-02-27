

# Remover texto "Ticket Up" do header da tela de login

## Objetivo

Manter apenas a logomarca (imagem) nos dois headers da pagina de autenticacao, removendo o texto "Ticket Up" e o subtitulo "Sistema de Gestao de Eventos".

## Mudancas

### `src/pages/Auth.tsx`

Duas secoes de header serao simplificadas:

**Header do Setup Inicial (linhas 197-207):**
- Remover o `h1` com texto "Ticket Up"
- Remover o `p` com subtitulo
- Aumentar o tamanho da logo (h-16 w-16)
- Centralizar apenas a imagem

**Header do Login (linhas 351-362):**
- Mesma alteracao: remover `h1` e `p`, manter apenas a logo maior e centralizada

Resultado visual:

```text
    [  Logo 64x64  ]

  +------------------+
  | Bem-vindo        |
  | ...               |
  +------------------+
```

Nenhum outro arquivo sera alterado.
