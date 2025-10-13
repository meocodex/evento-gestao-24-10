# Testes de Workflows do Sistema

## ✅ Checklist de Testes por Módulo

### 1. Autenticação e Perfis

#### 1.1 Login e Registro
- [ ] Fazer login com usuário admin@admin.com
- [ ] Verificar se o perfil carrega corretamente
- [ ] Verificar se o papel (role) é 'admin'
- [ ] Tentar fazer logout e login novamente

#### 1.2 Gestão de Perfis
- [ ] Acessar configurações do usuário
- [ ] Atualizar informações do perfil (nome, telefone)
- [ ] Verificar se as alterações são salvas

---

### 2. Gestão de Clientes

#### 2.1 Criar Cliente (CPF)
- [ ] Ir para a página de Clientes
- [ ] Clicar em "Novo Cliente"
- [ ] Preencher com os dados:
  - Nome: "João Silva Teste"
  - Tipo: CPF
  - CPF: "123.456.789-00"
  - Email: "joao.teste@email.com"
  - Telefone: "(11) 99999-9999"
  - CEP: "01310-100"
- [ ] Salvar e verificar se aparece na listagem

#### 2.2 Criar Cliente (CNPJ)
- [ ] Clicar em "Novo Cliente"
- [ ] Preencher com os dados:
  - Nome: "Empresa Teste Ltda"
  - Tipo: CNPJ
  - CNPJ: "12.345.678/0001-00"
  - Email: "contato@empresateste.com"
  - Telefone: "(11) 3333-3333"
  - CEP: "01310-100"
- [ ] Salvar e verificar se aparece na listagem

#### 2.3 Editar e Excluir Cliente
- [ ] Selecionar um cliente e clicar em "Editar"
- [ ] Alterar o telefone
- [ ] Salvar e verificar se a alteração foi aplicada
- [ ] Tentar excluir o cliente

---

### 3. Gestão de Eventos

#### 3.1 Criar Evento de Ingresso
- [ ] Ir para a página de Eventos
- [ ] Clicar em "Novo Evento"
- [ ] Preencher Passo 1 (Dados Básicos):
  - Tipo: Ingresso
  - Nome: "Festival de Música 2025"
  - Data Início: próxima sexta
  - Data Fim: próximo domingo
  - Horário Início: 18:00
  - Horário Fim: 23:00
- [ ] Preencher Passo 2 (Localização):
  - Local: "Parque Municipal"
  - Cidade: "São Paulo"
  - Estado: "SP"
  - Endereço: "Av. Paulista, 1000"
- [ ] Preencher Passo 3 (Responsáveis):
  - Cliente: Selecionar cliente criado
  - Comercial: Admin (você)
  - Descrição: "Festival com 3 dias de shows"
- [ ] Passo 4 (Configurações):
  - Adicionar 2 setores (Pista e Camarote)
  - Configurar lotes de ingresso
  - Adicionar tags: "música", "festival"
- [ ] Salvar evento

#### 3.2 Criar Evento de Bar
- [ ] Clicar em "Novo Evento"
- [ ] Preencher dados básicos:
  - Tipo: Bar
  - Nome: "Festa Corporativa XYZ"
  - Data: próximo sábado
- [ ] Configurar:
  - 5 máquinas de cartão
  - 3 bares
  - Com cardápio
- [ ] Salvar evento

#### 3.3 Criar Evento Híbrido
- [ ] Clicar em "Novo Evento"
- [ ] Selecionar tipo: Híbrido
- [ ] Configurar tanto setores de ingresso quanto bar
- [ ] Salvar evento

#### 3.4 Workflow de Status do Evento
- [ ] Abrir o evento "Festival de Música 2025"
- [ ] Verificar status inicial: "Orçamento Enviado"
- [ ] Alterar status para "Confirmado"
- [ ] Verificar se apareceu na timeline
- [ ] Alterar para "Materiais Alocados"
- [ ] Alterar para "Em Preparação"
- [ ] Alterar para "Em Andamento"
- [ ] Alterar para "Aguardando Retorno"
- [ ] Alterar para "Finalizado"

---

### 4. Gestão de Estoque

#### 4.1 Adicionar Material
- [ ] Ir para página de Estoque
- [ ] Clicar em "Novo Material"
- [ ] Preencher:
  - Nome: "Moving Head 200W"
  - Categoria: Iluminação
  - Quantidade Total: 10
  - Valor Unitário: R$ 5.000,00
- [ ] Salvar e verificar na listagem

#### 4.2 Adicionar Número de Série
- [ ] Clicar no material criado
- [ ] Na aba "Seriais", clicar em "Adicionar Serial"
- [ ] Preencher:
  - Número: "MH001"
  - Localização: "Depósito A"
  - Data de Aquisição: data atual
- [ ] Adicionar mais 4 seriais (MH002, MH003, MH004, MH005)

#### 4.3 Adicionar Material ao Checklist do Evento
- [ ] Voltar para o evento "Festival de Música 2025"
- [ ] Ir para aba "Materiais"
- [ ] Clicar em "Adicionar ao Checklist"
- [ ] Selecionar "Moving Head 200W"
- [ ] Quantidade: 5
- [ ] Salvar

#### 4.4 Alocar Material Específico
- [ ] Na aba "Materiais", clicar em "Alocar Material"
- [ ] Selecionar material: "Moving Head 200W"
- [ ] Selecionar serial: "MH001"
- [ ] Tipo de envio: "Com Técnicos"
- [ ] Responsável: "João Silva"
- [ ] Salvar
- [ ] Repetir para mais 2 seriais

---

### 5. Gestão de Equipe

#### 5.1 Adicionar Membro à Equipe do Evento
- [ ] No evento, ir para aba "Operação"
- [ ] Na seção "Equipe Alocada", clicar em "+"
- [ ] Preencher:
  - Nome: "José Santos"
  - Função: "Técnico de Som"
  - Telefone: "(11) 98888-8888"
- [ ] Salvar

#### 5.2 Adicionar Mais Membros
- [ ] Adicionar "Maria Oliveira" - Técnica de Luz
- [ ] Adicionar "Carlos Mendes" - Rigger
- [ ] Verificar se todos aparecem na lista

---

### 6. Gestão Financeira do Evento

#### 6.1 Adicionar Receita
- [ ] No evento, ir para aba "Financeiro"
- [ ] Clicar em "Adicionar Receita"
- [ ] Preencher:
  - Descrição: "Venda de Ingressos - Pista"
  - Tipo: Quantidade
  - Quantidade: 500
  - Valor Unitário: R$ 100,00
  - Data: data do evento
  - Status: Pendente
- [ ] Salvar

#### 6.2 Adicionar Despesa
- [ ] Clicar em "Adicionar Despesa"
- [ ] Preencher:
  - Descrição: "Transporte de equipamentos"
  - Categoria: Transporte
  - Quantidade: 2
  - Valor Unitário: R$ 1.500,00
  - Data: data do evento
- [ ] Salvar

#### 6.3 Marcar Receita como Paga
- [ ] Selecionar a receita criada
- [ ] Alterar status para "Pago"
- [ ] Verificar se o status foi atualizado

---

### 7. Gestão de Demandas

#### 7.1 Criar Demanda Técnica
- [ ] Ir para página de Demandas
- [ ] Clicar em "Nova Demanda"
- [ ] Preencher:
  - Título: "Consertar mesa de som"
  - Categoria: Técnica
  - Prioridade: Alta
  - Evento: (selecionar evento criado)
  - Descrição: "Mesa apresentando ruído no canal 4"
  - Prazo: +3 dias
- [ ] Salvar

#### 7.2 Criar Demanda de Reembolso
- [ ] Clicar em "Nova Demanda de Reembolso"
- [ ] Preencher:
  - Título: "Reembolso combustível"
  - Valor: R$ 250,00
  - Evento: (selecionar evento)
  - Descrição: "Viagem para São Paulo"
- [ ] Anexar comprovante (imagem fictícia)
- [ ] Salvar

#### 7.3 Atribuir Responsável à Demanda
- [ ] Selecionar demanda técnica
- [ ] Clicar em "Editar"
- [ ] Atribuir responsável (você mesmo)
- [ ] Verificar se recebeu notificação

#### 7.4 Aprovar/Recusar Reembolso
- [ ] Abrir demanda de reembolso
- [ ] Clicar em "Aprovar Reembolso"
- [ ] Ou clicar em "Recusar" e informar motivo
- [ ] Verificar se status foi atualizado

---

### 8. Gestão de Transportadoras

#### 8.1 Cadastrar Transportadora
- [ ] Ir para página de Transportadoras
- [ ] Clicar em "Nova Transportadora"
- [ ] Preencher:
  - Nome: "TransLog Express"
  - CNPJ: "98.765.432/0001-00"
  - Razão Social: "TransLog Logística Ltda"
  - Email: "contato@translog.com"
  - Telefone: "(11) 3333-4444"
  - Responsável: "Pedro Alves"
  - CEP: "01310-100"
- [ ] Salvar

#### 8.2 Adicionar Rotas
- [ ] Selecionar transportadora
- [ ] Clicar em "Gerenciar Rotas"
- [ ] Adicionar rota:
  - Destino: São Paulo - SP
  - Prazo: 2 dias
  - Valor Base: R$ 500,00
- [ ] Adicionar mais rotas para outras cidades

#### 8.3 Criar Envio
- [ ] Clicar em "Novo Envio"
- [ ] Preencher:
  - Transportadora: TransLog Express
  - Tipo: Ida
  - Origem: Cuiabá - MT
  - Destino: São Paulo - SP
  - Evento: (selecionar evento)
  - Data Coleta: hoje
  - Data Entrega Prevista: +2 dias
  - Valor: R$ 500,00
  - Forma Pagamento: Cartão de Crédito
- [ ] Salvar

---

### 9. Contratos e Propostas

#### 9.1 Criar Template de Contrato
- [ ] Ir para página de Contratos
- [ ] Clicar em "Novo Template"
- [ ] Preencher:
  - Nome: "Contrato de Locação de Equipamentos"
  - Tipo: Locação
  - Descrição: "Template padrão para locação"
  - Conteúdo: (inserir texto do contrato com variáveis)
- [ ] Salvar

#### 9.2 Criar Contrato a partir do Template
- [ ] Clicar em "Novo Contrato"
- [ ] Selecionar template criado
- [ ] Preencher:
  - Cliente: (selecionar cliente)
  - Evento: (selecionar evento)
  - Valor: R$ 50.000,00
  - Data Início: data do evento
  - Data Fim: data do evento
  - Condições de Pagamento: "50% antecipado, 50% após evento"
- [ ] Salvar

#### 9.3 Simular Assinatura
- [ ] Abrir contrato criado
- [ ] Clicar em "Simular Assinatura"
- [ ] Verificar visualização do PDF
- [ ] Alterar status para "Em Análise"

---

### 10. Cadastros Públicos

#### 10.1 Simular Cadastro Público de Evento
- [ ] Abrir em janela anônima: `/public/cadastro-evento`
- [ ] Preencher formulário completo:
  - Tipo: Ingresso
  - Nome do Evento: "Rock na Praça"
  - Datas e horários
  - Dados do produtor (nome, CPF, email, telefone)
  - Configurações de ingresso
- [ ] Submeter formulário
- [ ] Anotar protocolo gerado

#### 10.2 Aprovar Cadastro Público
- [ ] Login como admin
- [ ] Ir para "Cadastros Pendentes"
- [ ] Localizar cadastro pelo protocolo
- [ ] Revisar informações
- [ ] Aprovar cadastro
- [ ] Verificar se evento foi criado

---

### 11. Dashboard e Relatórios

#### 11.1 Verificar Dashboard
- [ ] Ir para Dashboard
- [ ] Verificar cards de estatísticas:
  - Total de eventos
  - Eventos do mês
  - Eventos ativos
  - Total de clientes
- [ ] Verificar gráfico de eventos por mês
- [ ] Verificar lista de próximos eventos

#### 11.2 Filtros e Buscas
- [ ] Testar busca de eventos por nome
- [ ] Filtrar eventos por status
- [ ] Filtrar eventos por tipo
- [ ] Filtrar eventos por data
- [ ] Testar filtros de clientes
- [ ] Testar filtros de demandas

---

### 12. Notificações

#### 12.1 Verificar Sistema de Notificações
- [ ] Clicar no sino de notificações
- [ ] Verificar se há notificações de:
  - Demanda atribuída
  - Evento confirmado
  - Reembolso aprovado/recusado
- [ ] Marcar notificações como lidas
- [ ] Verificar se contador atualiza

---

### 13. Configurações

#### 13.1 Configurações de Empresa
- [ ] Ir para Configurações
- [ ] Aba "Empresa"
- [ ] Preencher dados da empresa:
  - Nome
  - CNPJ
  - Email
  - Telefone
  - Endereço completo
- [ ] Fazer upload de logo
- [ ] Salvar

#### 13.2 Gerenciar Categorias
- [ ] Aba "Categorias"
- [ ] Adicionar nova categoria em "Demandas"
- [ ] Desativar categoria existente
- [ ] Reativar categoria
- [ ] Salvar alterações

#### 13.3 Preferências do Sistema
- [ ] Aba "Sistema"
- [ ] Testar alteração de tema (claro/escuro)
- [ ] Configurar notificações (email, push)
- [ ] Salvar preferências

---

## 🔄 Testes de Workflows Completos

### Workflow 1: Criação de Evento Completo
1. Criar cliente novo
2. Criar evento associado ao cliente
3. Adicionar materiais ao checklist
4. Alocar materiais específicos
5. Adicionar equipe
6. Adicionar receitas e despesas
7. Criar contrato
8. Alterar status do evento progressivamente
9. Finalizar evento

### Workflow 2: Gestão de Demandas
1. Criar demanda técnica
2. Atribuir responsável
3. Adicionar comentários
4. Anexar arquivos
5. Resolver demanda
6. Arquivar demanda

### Workflow 3: Logística de Materiais
1. Cadastrar material no estoque
2. Adicionar números de série
3. Alocar para evento (envio antecipado)
4. Criar envio com transportadora
5. Atualizar status de entrega
6. Registrar retorno do material

### Workflow 4: Processo Comercial
1. Receber cadastro público
2. Analisar proposta
3. Aprovar e criar evento
4. Gerar contrato
5. Coletar assinaturas
6. Confirmar evento
7. Executar evento
8. Realizar fechamento financeiro

---

## ✅ Critérios de Sucesso

### Funcionalidade
- [ ] Todos os CRUD funcionam corretamente
- [ ] Filtros e buscas retornam resultados corretos
- [ ] Validações de formulários funcionam
- [ ] Mensagens de erro são claras
- [ ] Mensagens de sucesso aparecem após ações

### Performance
- [ ] Páginas carregam em menos de 2 segundos
- [ ] Listagens com muitos itens são paginadas
- [ ] Não há travamentos ou lentidão

### Segurança
- [ ] RLS impede acesso não autorizado
- [ ] Apenas admin pode excluir registros
- [ ] Dados financeiros só visíveis para admin
- [ ] Uploads de arquivos funcionam corretamente

### UI/UX
- [ ] Interface responsiva (mobile e desktop)
- [ ] Feedbacks visuais em ações
- [ ] Estados de loading aparecem
- [ ] Navegação intuitiva
- [ ] Ícones e labels claros

---

## 🐛 Registro de Bugs Encontrados

| ID | Módulo | Descrição | Prioridade | Status |
|----|--------|-----------|------------|--------|
| 1  |        |           |            |        |
| 2  |        |           |            |        |

---

## 📝 Observações Gerais

- Data do teste: __/__/____
- Testador: _____________
- Versão: _____________
- Navegador: _____________

### Comentários Adicionais:
_____________________________________________
_____________________________________________
_____________________________________________
