
## Diagnóstico: Por que /contratos ainda existe

O plano de simplificação foi **aprovado mas nunca executado**. As sessões anteriores focaram apenas em corrigir erros de TypeScript. Todo o módulo antigo permanece intacto.

### O que ainda existe (e deve ser removido/substituído)

| Arquivo/Local | Situação |
|---|---|
| `src/pages/Contratos.tsx` | Ainda existe - página antiga completa |
| `src/components/contratos/*` | 9 arquivos ainda presentes |
| `src/components/propostas/*` | 4 arquivos ainda presentes |
| `src/contexts/contratos/*` | 5 arquivos ainda presentes |
| `src/hooks/contratos/index.ts` | Barrel export ainda presente |
| `src/types/contratos.ts` | Tipos antigos ainda presentes |
| `App.tsx` linha 22 | `import Contratos` ainda existe |
| `App.tsx` linha 112 | Rota `/contratos` ainda existe |
| `AppSidebar.tsx` linha 44 | Item "Contratos" no array `menuItems` |
| `AppSidebar.tsx` linhas 98-99 | Case "Contratos" no switch de permissões |

---

### Plano de Execução Completo

#### Fase 1 - Banco de dados: Criar tabela `eventos_contratos`

```sql
CREATE TABLE eventos_contratos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('bar', 'ingresso', 'bar_ingresso', 'credenciamento')),
  titulo text NOT NULL,
  conteudo text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado')),
  arquivo_assinado_url text DEFAULT NULL,
  arquivo_assinado_nome text DEFAULT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE eventos_contratos ENABLE ROW LEVEL SECURITY;

-- Policy: usuários autenticados podem ver/gerenciar contratos dos eventos que têm acesso
CREATE POLICY "Authenticated users can manage eventos_contratos"
  ON eventos_contratos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Trigger para updated_at automático
CREATE TRIGGER update_eventos_contratos_updated_at
  BEFORE UPDATE ON eventos_contratos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índice em evento_id
CREATE INDEX idx_eventos_contratos_evento_id ON eventos_contratos(evento_id);
```

Storage bucket para contratos assinados (PDF upload).

---

#### Fase 2 - Remover módulo antigo

Deletar os seguintes arquivos:
- `src/pages/Contratos.tsx`
- `src/components/contratos/` (9 arquivos)
- `src/components/propostas/` (4 arquivos)
- `src/contexts/contratos/` (5 arquivos)
- `src/hooks/contratos/index.ts`
- `src/types/contratos.ts`

Editar:
- `src/App.tsx` — remover import `Contratos` e rota `contratos`
- `src/components/layout/AppSidebar.tsx` — remover item "Contratos" do menu e do switch
- `src/hooks/usePrefetchPages.ts` — remover prefetch de contratos se existir

---

#### Fase 3 - Criar novos tipos e modelos

**`src/types/evento-contratos.ts`**
```typescript
export type TipoContratoEvento = 'bar' | 'ingresso' | 'bar_ingresso' | 'credenciamento';
export type StatusContratoEvento = 'rascunho' | 'finalizado';

export interface ContratoEvento {
  id: string;
  eventoId: string;
  tipo: TipoContratoEvento;
  titulo: string;
  conteudo: string;
  status: StatusContratoEvento;
  arquivoAssinadoUrl: string | null;
  arquivoAssinadoNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}
```

**`src/lib/modelos-contrato.ts`** — 4 modelos de texto com variáveis:
- `{{CLIENTE_NOME}}`, `{{CLIENTE_DOCUMENTO}}`, `{{CLIENTE_EMAIL}}`, `{{CLIENTE_TELEFONE}}`
- `{{EVENTO_NOME}}`, `{{EVENTO_DATA_INICIO}}`, `{{EVENTO_DATA_FIM}}`, `{{EVENTO_LOCAL}}`, `{{EVENTO_CIDADE}}`, `{{EVENTO_ESTADO}}`
- `{{EMPRESA_NOME}}`, `{{DATA_HOJE}}`
- Função `gerarContratoFromModelo(tipo, evento, cliente)` que substitui as variáveis

---

#### Fase 4 - Criar hook de contratos do evento

**`src/hooks/useEventoContratos.ts`**
- Query: `useQuery` para listar contratos de um evento
- Mutation: criar contrato a partir de modelo
- Mutation: salvar edição do conteúdo
- Mutation: alterar status (rascunho → finalizado)
- Mutation: excluir contrato
- Mutation: upload de contrato assinado (arquivo PDF/imagem) para storage

---

#### Fase 5 - Reescrever aba Contratos no Evento

**`src/components/eventos/secoes/ContratosEvento.tsx`** (reescrito)

Interface:
```
┌─────────────────────────────────────────────────┐
│  Contratos do Evento           [Gerar Contrato ▼] │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ 📄 Contrato de Bar          [Rascunho]       │  │
│  │ Criado em 15/02/2026        [Editar] [PDF]   │  │
│  │ 📎 contrato_assinado.pdf    [Ver arquivo]    │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ 📄 Credenciamento           [Finalizado ✓]   │  │
│  │ Criado em 10/02/2026        [Editar] [PDF]   │  │
│  │ 📎 Sem arquivo assinado     [Anexar PDF]     │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

Dropdown "Gerar Contrato" com 4 opções:
1. Contrato de Bar
2. Contrato de Ingresso
3. Contrato de Bar e Ingresso
4. Credenciamento

**`src/components/eventos/secoes/EditarContratoEventoSheet.tsx`** (novo)
- Sheet lateral com textarea grande para editar o texto do contrato
- Botão "Salvar Rascunho" e botão "Finalizar Contrato"
- Upload de arquivo assinado (botão "Anexar Contrato Assinado") com drag & drop
- Exibição do arquivo já anexado com link para download

---

#### Fase 6 - Limpeza de referências

- `src/hooks/usePrefetchPages.ts` — remover `contratos` do prefetch
- `src/hooks/useDashboardStats.ts` — verificar e remover contagem de contratos antigos
- `queryKeys.ts` — remover chaves antigas de contratos/templates/propostas
- Verificar `EventoDetalhes.tsx` e `EventoDetailsSheet.tsx` para garantir que usam o novo `ContratosEvento`

---

### Resumo de Impacto

| Ação | Quantidade |
|---|---|
| Arquivos removidos | ~20 |
| Arquivos criados | 5 |
| Arquivos editados | ~6 |
| Migração de banco | 1 (tabela `eventos_contratos` + storage bucket) |
| Rota removida | `/contratos` |
| Item removido do menu | "Contratos" |

### Resultado Final

O usuário acessa contratos **dentro do evento**, gera um dos 4 modelos, edita online, e quando o cliente devolver assinado, faz upload do PDF diretamente no evento. Simples, direto, sem módulo separado.
