
## Simplificação: Aba "Contratos" → "Documentos"

### Objetivo

Substituir o fluxo atual de geração de contratos por modelos por uma solução simples e direta: uma aba chamada **"Documentos"** onde o usuário pode fazer upload de qualquer arquivo relevante ao evento (proposta comercial, contrato assinado, rider técnico, etc.), informando apenas um nome descritivo.

---

### Situação Atual (problema)

A aba "Contratos" atual exige:
1. Escolher um tipo de modelo (Bar, Ingresso, etc.)
2. Gerar o contrato com preenchimento automático
3. Editar o texto num textarea
4. Finalizar o contrato
5. Depois ainda fazer upload do arquivo assinado

Isso é complexo demais para o caso de uso real: o usuário já tem os documentos prontos (PDF, Word, imagem) e quer apenas anexá-los ao evento.

---

### Nova Solução

Uma aba simples de upload de documentos, com:

- **Botão "Adicionar Documento"** que abre um pequeno diálogo com:
  - Campo de nome livre (ex: "Proposta Comercial", "Contrato Assinado", "Rider Técnico")
  - Seletor de arquivo (qualquer formato: PDF, DOC, DOCX, JPG, PNG)
- **Lista de documentos** exibindo: nome, data de upload, tipo de arquivo, botão de download e botão de excluir
- **Download direto** (fetch + blob, conforme preferência do usuário registrada na memória)

---

### Impacto nas Tabelas

A tabela `eventos_contratos` já existe mas será usada de forma diferente:
- **Remover**: campos `tipo`, `conteudo`, `status` do uso (manter no banco por compatibilidade)
- **Usar**: apenas `evento_id`, `titulo` (nome do documento), `arquivo_assinado_url`, `arquivo_assinado_nome`, `created_at`

Não é necessária migração de banco - a tabela já comporta esse uso simples.

---

### Arquivos a Modificar

| Arquivo | Ação |
|---|---|
| `src/components/eventos/secoes/ContratosEvento.tsx` | Reescrever completamente — virar `DocumentosEvento` |
| `src/pages/EventoDetalhes.tsx` | Renomear tab "Contratos" → "Documentos" |
| `src/components/eventos/EventoDetailsSheet.tsx` | Renomear tab "Contratos" → "Documentos" |
| `src/hooks/useEventoContratos.ts` | Simplificar — remover criarContrato por modelo, editarContrato, finalizarContrato; adicionar `adicionarDocumento` (titulo + arquivo) |
| `src/components/eventos/secoes/EditarContratoEventoSheet.tsx` | Deletar — não é mais necessário |
| `src/types/evento-contratos.ts` | Simplificar tipos |
| `src/lib/modelos-contrato.ts` | Pode ser deletado (não será mais usado) |

---

### Nova Interface (DocumentosEvento)

```text
┌─────────────────────────────────────────────────────────┐
│  Documentos do Evento              [+ Adicionar Arquivo] │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📄 Proposta Comercial.pdf        05/02/2026       │   │
│  │                              [⬇ Baixar] [🗑 Excl] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📄 Contrato Assinado.pdf         10/02/2026       │   │
│  │                              [⬇ Baixar] [🗑 Excl] │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

Ao clicar em **"+ Adicionar Arquivo"**, abre um diálogo compacto:

```text
┌────────────────────────────────────────┐
│  Adicionar Documento                   │
│                                        │
│  Nome do documento *                   │
│  ┌──────────────────────────────────┐  │
│  │ ex: Proposta Comercial           │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Arquivo *                             │
│  ┌──────────────────────────────────┐  │
│  │  📎 Clique para selecionar       │  │
│  └──────────────────────────────────┘  │
│                                        │
│           [Cancelar]  [Enviar]         │
└────────────────────────────────────────┘
```

---

### Detalhes Técnicos

**Hook simplificado `useEventoDocumentos`:**
- `documentos` — lista de documentos do evento
- `adicionarDocumento(titulo, arquivo)` — faz upload no bucket `contratos` e salva referência na tabela
- `removerDocumento(id, url)` — remove do storage e da tabela

**Download de arquivos:**
- Usar `fetch` + `blob URL` para disparar download no disco (padrão já estabelecido no projeto para evitar bloqueio do Chrome)

**Storage:**
- Bucket: `contratos` (já existe, privado)
- Path: `{eventoId}/{timestamp}-{nome_arquivo}`
- URL: usar `createSignedUrl` (1 hora) para exibir/baixar, mantendo o bucket privado e seguro

**Renomeação da aba:**
- `value="contratos"` mantido internamente para não quebrar URL/routing
- Label exibido muda de "Contratos" para "Documentos"

---

### Resumo de Mudanças

- **3 arquivos editados**: `ContratosEvento.tsx`, `EventoDetalhes.tsx`, `EventoDetailsSheet.tsx`
- **1 hook refatorado**: `useEventoContratos.ts` → simplificado
- **1 arquivo deletado**: `EditarContratoEventoSheet.tsx`
- **1 arquivo deletado**: `src/lib/modelos-contrato.ts`
- **Sem migração de banco necessária**
