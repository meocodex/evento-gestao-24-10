

# Analise: Cadastro Publico vs Cadastro Interno + Obrigatoriedade de Imagens

## 1. Comparacao Cadastro Publico vs Interno

### Cadastro Interno (`NovoEventoSheet`)
O formulario interno cria eventos diretamente na tabela `eventos` com campos: nome, tipo_evento, datas, horarios, local, endereco, cidade, estado, cliente_id, comercial_id, tags, descricao, observacoes. **Nao coleta dados de produtor, dados bancarios, nem configuracoes de ingresso/bar no momento da criacao** - essas configuracoes sao editadas depois.

### Cadastro Publico (`CadastroEvento`)
O formulario publico cria registros na tabela `cadastros_publicos` com um fluxo de 6 etapas que coleta **muito mais informacao**:
- Step 1: Tipo do evento
- Step 2: Dados basicos (nome, datas, endereco com CEP)
- Step 3: Produtor (documento, contato, endereco, responsavel legal)
- Step 4: Configuracoes (setores/ingressos/banners OU bar/estabelecimentos)
- Step 5: Dados bancarios e observacoes
- Step 6: Revisao e envio

**Conclusao**: Os dois cadastros sao coerentes em proposito - o publico e um "pre-cadastro" que depois e aprovado e convertido em evento interno. Os campos do cadastro publico alimentam tanto a tabela `cadastros_publicos` quanto futuramente o `eventos` + `clientes`. A estrutura esta adequada.

---

## 2. Problema: Imagens NAO sao obrigatorias

No Step 4, as 4 imagens (Banner, Miniatura, Mapa, Ingresso POS) estao todas como **opcionais**:

- Linha 1194: `"Envie as imagens para divulgação do seu evento (todas opcionais)"`
- Os states sao `useState<string | undefined>()` sem validacao
- A validacao do botao "Proximo" (linha 1596-1599) so verifica nomes de setores/tipos, **nao verifica imagens**

### Requisito do usuario
- **Banner Site (1170x400px)** → OBRIGATORIO
- **Miniatura Site (500x500px)** → OBRIGATORIO
- **Ingresso POS (300x200px)** → opcional
- **Mapa Site (1000x1000px)** → opcional

## Plano de implementacao

### Arquivo: `src/pages/public/CadastroEvento.tsx`

**1. Alterar descricao do card de imagens** (linha 1193-1195):
```
De: "Envie as imagens para divulgação do seu evento (todas opcionais)"
Para: "Envie as imagens para divulgação do seu evento. Banner e Miniatura são obrigatórios."
```

**2. Adicionar indicador visual de obrigatoriedade nos campos Banner e Miniatura**:
- Passar uma prop `required` para o `ImageUploadField` dos campos Banner e Miniatura
- Exibir asterisco (*) e borda de alerta quando vazio

**3. Alterar validacao do botao "Proximo" no Step 4** (linha 1596-1599):
Adicionar verificacao de `bannerSite` e `miniaturaSite` na condicao `disabled`:
```typescript
disabled={
  (tipoEvento === 'ingresso' || tipoEvento === 'hibrido') && (
    !bannerSite || !miniaturaSite ||
    setores.some(s => !s.nome.trim() || s.tiposIngresso.some(t => !t.nome.trim()))
  )
}
```

### Arquivo: `src/components/cadastro/ImageUploadField.tsx`

**4. Adicionar prop `required` ao componente**:
- Exibir asterisco no label quando `required={true}`
- Exibir borda vermelha/laranja quando required e sem valor

### Resumo de arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/public/CadastroEvento.tsx` | Texto descritivo, props `required` nos campos Banner/Miniatura, validacao no botao |
| `src/components/cadastro/ImageUploadField.tsx` | Adicionar suporte a prop `required` com feedback visual |

