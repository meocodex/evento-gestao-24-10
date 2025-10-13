# Checklist de Testes Manuais - Sistema de Gestão de Eventos

Este documento contém os casos de teste manuais para validação do sistema antes de releases e após mudanças significativas.

## 📋 Instruções Gerais

- ✅ = Passou no teste
- ❌ = Falhou no teste
- ⏭️ = Não aplicável / Pulado

Execute os testes em ordem e marque o resultado em cada item.

---

## 🔐 1. Autenticação e Segurança

### 1.1 Login
- [ ] Login com credenciais válidas redireciona para dashboard
- [ ] Login com credenciais inválidas exibe erro apropriado
- [ ] Campos de email e senha são obrigatórios
- [ ] Email deve ter formato válido
- [ ] Senha deve ter no mínimo 6 caracteres
- [ ] Botão de login fica desabilitado durante processamento
- [ ] Erro de rede é tratado adequadamente

### 1.2 Registro
- [ ] Criar conta com dados válidos funciona
- [ ] Email duplicado exibe erro apropriado
- [ ] Todos os campos obrigatórios são validados
- [ ] Senha fraca é rejeitada
- [ ] Confirmação de email é enviada (se configurado)
- [ ] Após registro bem-sucedido, usuário é redirecionado

### 1.3 Logout
- [ ] Logout limpa sessão corretamente
- [ ] Após logout, usuário é redirecionado para /auth
- [ ] Tentar acessar rotas protegidas após logout redireciona para login

### 1.4 Proteção de Rotas
- [ ] Usuário não autenticado não acessa rotas protegidas
- [ ] Redirecionamento para /auth funciona corretamente
- [ ] Usuário autenticado acessa dashboard normalmente

---

## 👥 2. Gestão de Clientes

### 2.1 Listar Clientes
- [ ] Lista de clientes carrega corretamente
- [ ] Paginação funciona (se implementada)
- [ ] Busca por nome funciona
- [ ] Filtros funcionam corretamente
- [ ] Mensagem de "nenhum cliente encontrado" aparece quando aplicável

### 2.2 Criar Cliente
- [ ] Modal/Sheet de novo cliente abre corretamente
- [ ] Validação de CPF funciona (11 dígitos)
- [ ] Validação de CNPJ funciona (14 dígitos)
- [ ] Formatação automática de CPF/CNPJ funciona
- [ ] Validação de email funciona
- [ ] Validação de telefone funciona
- [ ] CEP busca endereço via ViaCEP
- [ ] Todos os campos obrigatórios são validados
- [ ] Criar cliente com sucesso exibe toast de confirmação
- [ ] Lista de clientes é atualizada após criação

### 2.3 Editar Cliente
- [ ] Modal/Sheet de editar abre com dados preenchidos
- [ ] Todos os campos são editáveis
- [ ] Validações funcionam na edição
- [ ] Salvar alterações atualiza o cliente
- [ ] Toast de sucesso é exibido
- [ ] Lista é atualizada após edição

### 2.4 Visualizar Detalhes
- [ ] Modal/Sheet de detalhes exibe todas as informações
- [ ] Dados estão formatados corretamente
- [ ] Contatos estão exibidos corretamente

### 2.5 Excluir Cliente
- [ ] Confirmação de exclusão é exibida
- [ ] Excluir cliente remove da lista
- [ ] Toast de sucesso é exibido
- [ ] Não é possível excluir cliente com eventos associados (se aplicável)

---

## 🎉 3. Gestão de Eventos

### 3.1 Listar Eventos
- [ ] Cards/lista de eventos carrega corretamente
- [ ] Diferentes views (cards/tabela) funcionam
- [ ] Filtros por status funcionam
- [ ] Filtros por data funcionam
- [ ] Busca por nome funciona
- [ ] Ordenação funciona corretamente

### 3.2 Criar Evento
- [ ] Modal/Sheet de novo evento abre
- [ ] Cliente é selecionável
- [ ] Validação de data funciona (evento futuro)
- [ ] Validação de hora funciona
- [ ] Endereço pode ser preenchido
- [ ] Tipo de evento é obrigatório
- [ ] Público estimado aceita apenas números
- [ ] Criar evento com sucesso exibe toast
- [ ] Lista de eventos é atualizada

### 3.3 Editar Evento
- [ ] Modal/Sheet de editar abre com dados corretos
- [ ] Todos os campos são editáveis
- [ ] Não é possível editar eventos passados (se regra de negócio)
- [ ] Salvar alterações funciona
- [ ] Lista é atualizada após edição

### 3.4 Detalhes do Evento
- [ ] Modal/Dialog de detalhes exibe todas as informações
- [ ] Abas de navegação funcionam (se aplicável)
- [ ] Timeline do evento está correta
- [ ] Informações financeiras são exibidas
- [ ] Equipe e materiais são listados

### 3.5 Alterar Status
- [ ] Modal de alteração de status funciona
- [ ] Workflow de status é respeitado
- [ ] Observações podem ser adicionadas
- [ ] Status é atualizado corretamente
- [ ] Timeline registra a mudança

### 3.6 Excluir Evento
- [ ] Confirmação de exclusão é exibida
- [ ] Excluir evento remove da lista
- [ ] Toast de sucesso é exibido

---

## 📦 4. Gestão de Estoque

### 4.1 Listar Materiais
- [ ] Lista de materiais carrega
- [ ] Filtros funcionam corretamente
- [ ] Busca funciona
- [ ] Indicador de quantidade baixa funciona

### 4.2 Criar Material
- [ ] Modal de novo material abre
- [ ] Categoria é selecionável
- [ ] Quantidade aceita apenas números
- [ ] Quantidade mínima é obrigatória
- [ ] Criar material funciona
- [ ] Toast de sucesso é exibido

### 4.3 Editar Material
- [ ] Modal de editar abre com dados corretos
- [ ] Edição funciona corretamente
- [ ] Validações funcionam

### 4.4 Excluir Material
- [ ] Confirmação de exclusão é exibida
- [ ] Excluir material funciona
- [ ] Não é possível excluir material alocado a evento

### 4.5 Alocar Material a Evento
- [ ] Modal de alocação abre
- [ ] Quantidade disponível é verificada
- [ ] Não é possível alocar mais do que disponível
- [ ] Alocação reduz quantidade disponível
- [ ] Lista de materiais alocados é atualizada

---

## 📋 5. Gestão de Demandas

### 5.1 Listar Demandas
- [ ] Lista de demandas carrega
- [ ] Filtros por status funcionam
- [ ] Filtros por prioridade funcionam
- [ ] Busca funciona
- [ ] Indicador de prazo funciona

### 5.2 Criar Demanda
- [ ] Modal de nova demanda abre
- [ ] Evento é selecionável
- [ ] Título é obrigatório
- [ ] Prioridade é selecionável
- [ ] Data limite é validada
- [ ] Criar demanda funciona

### 5.3 Editar Demanda
- [ ] Modal de editar abre
- [ ] Status pode ser alterado
- [ ] Responsável pode ser atribuído
- [ ] Edição funciona

### 5.4 Adicionar Comentário
- [ ] Comentários podem ser adicionados
- [ ] Lista de comentários é atualizada
- [ ] Usuário e data são registrados

### 5.5 Upload de Anexos
- [ ] Upload de arquivo funciona
- [ ] Tipos de arquivo são validados
- [ ] Tamanho máximo é respeitado
- [ ] Anexo é listado após upload

---

## 💰 6. Financeiro

### 6.1 Dashboard Financeiro
- [ ] Cards de resumo carregam
- [ ] Valores estão corretos
- [ ] Gráficos são exibidos

### 6.2 Receitas
- [ ] Adicionar receita a evento funciona
- [ ] Validação de valor funciona
- [ ] Categoria é obrigatória
- [ ] Lista de receitas é atualizada

### 6.3 Despesas
- [ ] Adicionar despesa a evento funciona
- [ ] Comprovante pode ser anexado
- [ ] Status de pagamento funciona
- [ ] Lista de despesas é atualizada

### 6.4 Reembolsos
- [ ] Criar solicitação de reembolso funciona
- [ ] Aprovação/rejeição funciona
- [ ] Observações são registradas
- [ ] Status é atualizado

---

## 📄 7. Contratos e Propostas

### 7.1 Criar Proposta
- [ ] Modal de nova proposta abre
- [ ] Cliente é selecionável
- [ ] Itens podem ser adicionados
- [ ] Valores são calculados corretamente
- [ ] PDF da proposta é gerado

### 7.2 Converter para Contrato
- [ ] Proposta pode ser convertida
- [ ] Dados são preservados
- [ ] Status é atualizado

### 7.3 Gerenciar Templates
- [ ] Criar template funciona
- [ ] Editar template funciona
- [ ] Excluir template funciona
- [ ] Template pode ser usado em novo contrato

---

## 🚚 8. Transportadoras e Envios

### 8.1 Cadastrar Transportadora
- [ ] Modal de nova transportadora abre
- [ ] CNPJ é validado
- [ ] Telefone é validado
- [ ] Criar transportadora funciona

### 8.2 Criar Envio
- [ ] Modal de novo envio abre
- [ ] Evento é selecionável
- [ ] Transportadora é selecionável
- [ ] Rastreamento pode ser adicionado
- [ ] Criar envio funciona

### 8.3 Atualizar Status de Envio
- [ ] Status pode ser alterado
- [ ] Timeline é atualizada
- [ ] Observações são registradas

---

## 🔔 9. Notificações

### 9.1 Centro de Notificações
- [ ] Centro de notificações abre
- [ ] Lista de notificações carrega
- [ ] Marcar como lida funciona
- [ ] Marcar todas como lidas funciona
- [ ] Filtros funcionam

### 9.2 Notificações em Tempo Real
- [ ] Novas notificações aparecem automaticamente
- [ ] Badge de quantidade não lida funciona
- [ ] Sons/alertas funcionam (se configurado)

---

## 🎨 10. UI/UX e Responsividade

### 10.1 Desktop
- [ ] Layout é exibido corretamente em 1920x1080
- [ ] Sidebar funciona corretamente
- [ ] Modais e dialogs são responsivos
- [ ] Tabelas exibem scroll horizontal se necessário

### 10.2 Tablet
- [ ] Layout se adapta em 768px
- [ ] Sidebar colapsa em drawer mobile
- [ ] Touch gestures funcionam

### 10.3 Mobile
- [ ] Layout é usável em 375px
- [ ] Navegação mobile funciona
- [ ] Formulários são preenchíveis
- [ ] Botões têm tamanho adequado para toque

### 10.4 Modo Escuro/Claro
- [ ] Toggle de tema funciona
- [ ] Cores são apropriadas em ambos os modos
- [ ] Preferência é salva

---

## 🐛 11. Tratamento de Erros

### 11.1 Error Boundary
- [ ] Erro React é capturado pelo Error Boundary
- [ ] UI de fallback é exibida
- [ ] Botão "Tentar Novamente" funciona
- [ ] Detalhes do erro aparecem em dev mode

### 11.2 Erros de API
- [ ] Erro de rede exibe mensagem apropriada
- [ ] Timeout é tratado
- [ ] Erro 401 redireciona para login
- [ ] Erro 403 exibe "Acesso negado"
- [ ] Erro 404 exibe "Não encontrado"
- [ ] Erro 500 exibe "Erro no servidor"

### 11.3 Validações
- [ ] Erros de validação são exibidos nos campos
- [ ] Submit é bloqueado se houver erros
- [ ] Mensagens são claras e úteis

---

## 🔒 12. Segurança (Anti-Bot)

### 12.1 Formulário Público de Cadastro
- [ ] Formulário carrega normalmente
- [ ] Submissão normal (humano) funciona
- [ ] Honeypot field está oculto
- [ ] Preencher honeypot bloqueia submissão silenciosamente
- [ ] Nenhum erro é exibido ao bot
- [ ] Console registra "Bot detected" (apenas dev)

---

## 📊 13. Performance

### 13.1 Tempo de Carregamento
- [ ] Dashboard carrega em menos de 3 segundos
- [ ] Listas grandes carregam rapidamente
- [ ] Lazy loading de imagens funciona

### 13.2 Otimizações
- [ ] Paginação está implementada onde necessário
- [ ] Debounce em buscas funciona
- [ ] Cache de dados funciona (React Query)

---

## 🌐 14. Cadastro Público de Eventos

### 14.1 Acesso Público
- [ ] Rota /cadastro-evento é acessível sem login
- [ ] Formulário carrega corretamente
- [ ] Layout é profissional e atrativo

### 14.2 Envio de Cadastro
- [ ] Todos os campos obrigatórios são validados
- [ ] CPF/CNPJ do produtor é validado
- [ ] Email é validado
- [ ] Configuração de bar pode ser adicionada (se aplicável)
- [ ] Setores de ingresso podem ser configurados
- [ ] Submissão gera protocolo único
- [ ] Toast de sucesso exibe protocolo

### 14.3 Acompanhamento
- [ ] Rota /acompanhar-cadastro funciona
- [ ] Protocolo pode ser inserido
- [ ] Status do cadastro é exibido
- [ ] Observações são visíveis

---

## ✅ Critérios de Aceitação

Para aprovar um release, **pelo menos 95% dos testes** devem passar.

### Severidade de Falhas
- 🔴 **Crítica**: Impede uso principal do sistema (ex: login não funciona)
- 🟡 **Alta**: Funcionalidade importante quebrada (ex: criar evento falha)
- 🟢 **Média**: Problema em funcionalidade secundária (ex: filtro não funciona)
- ⚪ **Baixa**: Problema visual ou de UX menor (ex: alinhamento)

**Bloqueio de Release:**
- Qualquer falha **Crítica** bloqueia o release
- Mais de 3 falhas **Altas** bloqueiam o release
- Falhas **Médias** e **Baixas** devem ser priorizadas para próximo sprint

---

## 📝 Notas de Teste

Use este espaço para anotar observações durante os testes:

```
Data do Teste: __________
Testador: __________
Versão/Branch: __________

Observações:
-
-
-

Bugs Encontrados:
-
-
-
```

---

**Última atualização:** Sprint 2
**Responsável:** Equipe de Desenvolvimento
