# 📚 Documentação do Sistema

## 📋 Índice de Documentos

### 🔐 Sistema de Permissões

#### [PERMISSIONS_MIGRATION.md](./PERMISSIONS_MIGRATION.md)
Guia completo de migração do sistema de roles para permissões granulares.

**Conteúdo:**
- Resumo executivo da migração
- Mapeamento detalhado de roles → permissões
- Exemplos práticos de código
- Diferenças entre segurança de UI e backend
- Como criar permissões customizadas
- Troubleshooting de problemas comuns

**Público-alvo:** Desenvolvedores, Administradores

---

#### [TESTES_PERMISSOES.md](./TESTES_PERMISSOES.md)
Cenários de teste para validação do sistema de permissões.

**Conteúdo:**
- 6 cenários de teste críticos
- Passo a passo detalhado de cada teste
- Resultados esperados
- Checklist de validação completa
- Registro de execução

**Público-alvo:** QA, Desenvolvedores

---

## 🎯 Quick Links

### Para Desenvolvedores

- **Implementar verificação de permissões:** Ver seção "Exemplos de Uso" em `PERMISSIONS_MIGRATION.md`
- **Migrar código antigo:** Ver seção "Migração de Código Antigo" em `PERMISSIONS_MIGRATION.md`
- **Entender arquitetura:** Ver seção "Segurança: UI vs Backend" em `PERMISSIONS_MIGRATION.md`

### Para Administradores

- **Criar usuários com permissões customizadas:** Ver seção "Criando Permissões Customizadas" em `PERMISSIONS_MIGRATION.md`
- **Entender templates de permissões:** Ver seção "Mapeamento de Roles → Permissões" em `PERMISSIONS_MIGRATION.md`
- **Resolver problemas:** Ver seção "Troubleshooting" em `PERMISSIONS_MIGRATION.md`

### Para QA

- **Testar sistema de permissões:** Seguir `TESTES_PERMISSOES.md` do início ao fim
- **Validar segurança:** Executar "Cenário 3: RLS Impedindo Acessos" em `TESTES_PERMISSOES.md`

---

## 🔄 Status dos Documentos

| Documento | Última Atualização | Status | Versão |
|-----------|-------------------|--------|--------|
| 📘 [Hooks Guide](HOOKS.md) | Guia completo do padrão de hooks unificados | ✅ Completo | 2025-01-23 |
| PERMISSIONS_MIGRATION.md | 2025-10-22 | ✅ Completo | 1.0 |
| TESTES_PERMISSOES.md | 2025-10-22 | ✅ Completo | 1.0 |

---

## 📝 Convenções

### Emojis Utilizados

- 📚 Documentação geral
- 🔐 Segurança e permissões
- 🧪 Testes e validação
- ✅ Item completo/aprovado
- ❌ Item incompleto/reprovado
- ⚠️ Aviso importante
- 💡 Dica ou exemplo
- 🐛 Bug ou problema
- 🔄 Processo ou migração
- 🎯 Objetivo ou meta

### Estrutura de Títulos

- `#` H1 - Título principal do documento
- `##` H2 - Seções principais
- `###` H3 - Subseções
- `####` H4 - Detalhes específicos

---

## 🤝 Contribuindo

Para adicionar nova documentação:

1. Crie arquivo `.md` na pasta `docs/`
2. Use estrutura clara com títulos e emojis
3. Adicione exemplos de código quando relevante
4. Atualize este README com link para o novo documento
5. Atualize tabela de status

---

## 📞 Suporte

Para dúvidas sobre a documentação:
1. Consulte primeiro o documento relevante
2. Verifique seção de Troubleshooting
3. Entre em contato com a equipe de desenvolvimento
