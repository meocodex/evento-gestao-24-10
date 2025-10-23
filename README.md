# 🎉 Sistema de Gestão de Eventos

Sistema completo para gestão de eventos, clientes, demandas, estoque e operações logísticas. Desenvolvido com React, TypeScript e Lovable Cloud (Supabase).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Como Usar](#como-usar)
- [Testes](#testes)
- [Segurança](#segurança)
- [Deploy](#deploy)

---

## 🎯 Visão Geral

Este sistema foi desenvolvido para empresas de eventos que precisam gerenciar todo o ciclo de vida de seus projetos: desde o primeiro contato com o cliente, passando pela proposta comercial, execução do evento, até o fechamento financeiro.

### Principais Módulos

- **Dashboard**: Visão geral de métricas e KPIs
- **Clientes**: Cadastro completo com validação de CPF/CNPJ
- **Eventos**: Gestão completa do ciclo de vida
- **Demandas**: Controle de tarefas e prazos
- **Estoque**: Controle de materiais e alocações
- **Financeiro**: Receitas, despesas e reembolsos
- **Contratos**: Propostas e contratos digitais
- **Transportadoras**: Gestão de envios e rastreamento

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Login seguro com email/senha
- Proteção de rotas privadas
- Error Boundary global para captura de erros
- Validação anti-bot em formulários públicos (honeypot)
- Validação robusta de CPF/CNPJ

### 👥 Gestão de Clientes
- Cadastro com CPF ou CNPJ
- Validação e formatação automática de documentos
- Busca de endereço por CEP (integração ViaCEP)
- Histórico de eventos por cliente
- Filtros e busca avançada

### 🎉 Gestão de Eventos
- Workflow completo: Pendente → Confirmado → Em Andamento → Concluído → Cancelado
- Timeline de atividades
- Alocação de equipe e materiais
- Configuração de bar e setores de ingresso
- Checklist operacional
- Relatório de fechamento

### 📋 Demandas e Tarefas
- Sistema de demandas com prioridades
- Anexos e comentários
- Controle de prazos
- Atribuição de responsáveis
- Notificações em tempo real

### 📦 Controle de Estoque
- Cadastro de materiais por categoria
- Controle de quantidade mínima
- Alocação a eventos
- Rastreamento de disponibilidade
- Números de série (para itens específicos)

### 💰 Gestão Financeira
- Receitas e despesas por evento
- Reembolsos com aprovação
- Dashboards financeiros
- Comprovantes e anexos
- Relatórios de rentabilidade

### 📄 Contratos e Propostas
- Templates personalizáveis
- Geração de PDF
- Conversão de proposta para contrato
- Assinatura digital (planejado)
- Histórico de versões

### 🚚 Logística e Transportadoras
- Cadastro de transportadoras
- Criação de envios
- Rastreamento
- Gestão de rotas
- Status de entrega

### 🔔 Sistema de Notificações
- Centro de notificações
- Alertas em tempo real
- Priorização por importância
- Filtros e marcação de leitura

### 🌐 Cadastro Público
- Formulário de cadastro de evento sem login
- Geração de protocolo único
- Acompanhamento de status
- Proteção anti-bot

---

## 🛠️ Tecnologias

### Frontend
- **React 18.3** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router 6** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs
- **Sonner** - Notificações toast

### Backend (Lovable Cloud)
- **Supabase** - Backend-as-a-Service
  - PostgreSQL - Banco de dados
  - Row Level Security (RLS) - Segurança
  - Realtime - Atualizações em tempo real
  - Storage - Armazenamento de arquivos
  - Auth - Autenticação

### DevOps
- **Git** - Controle de versão
- **GitHub** - Repositório
- **Lovable Deploy** - Hospedagem

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn)
│   ├── shared/         # Componentes compartilhados
│   ├── clientes/       # Módulo de clientes
│   ├── eventos/        # Módulo de eventos
│   ├── demandas/       # Módulo de demandas
│   ├── estoque/        # Módulo de estoque
│   ├── contratos/      # Módulo de contratos
│   ├── transportadoras/# Módulo de transportadoras
│   ├── propostas/      # Módulo de propostas
│   └── layout/         # Layouts e navegação
├── contexts/           # Contexts e hooks de dados
│   ├── AuthContext.tsx
│   ├── EventosContext.tsx
│   ├── ClientesContext.tsx
│   └── ...
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
│   ├── api/           # Integrações externas
│   ├── errors/        # Tratamento de erros
│   ├── validations/   # Schemas de validação
│   └── utils.ts       # Helpers gerais
├── pages/              # Páginas principais
│   ├── public/        # Páginas públicas
│   └── ...
├── integrations/       # Integrações (Supabase)
└── types/              # Definições de tipos
```

### Padrões de Código

#### Hooks e Estado
- Cada módulo principal tem seu hook unificado (ex: `useEventos()`)
- Uso de TanStack Query para cache e sincronização servidor
- Hooks especializados para operações específicas (ex: `useEventoDetalhes()`)
- Transformações de dados isoladas em `/contexts/*/transform*.ts`
- Consulte [`docs/HOOKS.md`](./docs/HOOKS.md) para guia completo

#### Hooks Personalizados
- Hook unificado por recurso: `useEventos()`, `useClientes()`, etc
- Retorna queries + mutations em um objeto único
- Mutations retornam objetos completos (`.mutateAsync()`, `.isPending`)
- Hooks especializados para operações complexas
- Consulte [`docs/HOOKS.md`](./docs/HOOKS.md) para detalhes

#### Componentes
- Componentes funcionais com TypeScript
- Props tipadas com interfaces
- Uso de composição sobre herança
- Componentes pequenos e focados

#### Formulários
- React Hook Form + Zod para validação
- Schemas reutilizáveis em `lib/validations/`
- Feedback de erro inline
- Desabilitação durante submissão

#### Tratamento de Erros
- Error Boundary para erros React
- `handleApiError` para erros de API
- Toast notifications para feedback
- Logs detalhados em desenvolvimento

---

## 🚀 Como Usar

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Lovable (para backend)

### Instalação Local

```bash
# 1. Clonar repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### Configuração do Backend

O projeto usa **Lovable Cloud**, que configura automaticamente:
- ✅ Banco de dados PostgreSQL
- ✅ Autenticação de usuários
- ✅ Storage de arquivos
- ✅ Row Level Security (RLS)

Não é necessário criar conta no Supabase separadamente.

### Primeiro Uso

1. Acesse `/auth` para criar uma conta
2. Faça login com suas credenciais
3. Você será redirecionado para o Dashboard
4. Comece criando categorias em Configurações
5. Cadastre seu primeiro cliente
6. Crie seu primeiro evento

---

## 🧪 Testes

### Testes Manuais

Um checklist completo de testes manuais está disponível em [`TESTING.md`](./TESTING.md).

**Como usar:**
1. Abra o arquivo `TESTING.md`
2. Siga os testes em ordem
3. Marque cada item como ✅ (passou) ou ❌ (falhou)
4. Anote observações na seção de notas
5. Verifique critérios de aceitação antes do release

### Testes Automatizados (Planejado)

- [ ] Testes unitários com Vitest
- [ ] Testes de integração
- [ ] Testes E2E com Playwright
- [ ] Testes de acessibilidade

---

## 🔒 Segurança

### Autenticação
- Senhas armazenadas com hash bcrypt
- JWT tokens para sessões
- Auto-confirmação de email (desenvolvimento)
- Proteção de rotas com AuthContext

### Validação de Dados
- Validação client-side com Zod
- Validação server-side com RLS policies
- Sanitização de inputs
- Formatação automática de CPF/CNPJ

### Proteção Anti-Bot
- Honeypot field em formulários públicos
- Validação silenciosa (sem feedback ao bot)
- Rate limiting (planejado)

### Row Level Security (RLS)
Todas as tabelas do banco têm políticas RLS:
- Usuários só veem seus próprios dados
- Operações CRUD protegidas por permissões
- Auditoria de ações sensíveis

### Boas Práticas
- HTTPS obrigatório em produção
- Secrets gerenciados via Lovable Cloud
- Logs sensíveis removidos em produção
- Error Boundary para evitar vazamento de dados

---

## 📦 Deploy

### Deploy via Lovable (Recomendado)

1. Acesse o [projeto no Lovable](https://lovable.dev/projects/cf7dd661-5349-49e8-ad62-959226b1dcad)
2. Clique em **Share → Publish**
3. Sua aplicação será publicada automaticamente
4. Você receberá uma URL `https://seu-projeto.lovable.app`

### Deploy Manual (Netlify/Vercel)

```bash
# Build do projeto
npm run build

# A pasta dist/ contém os arquivos estáticos
```

Configure as variáveis de ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Importante:** As variáveis já estão no arquivo `.env` gerado pelo Lovable Cloud.

### Domínio Personalizado

Para usar domínio próprio, consulte a [documentação oficial](https://docs.lovable.dev/tips-tricks/custom-domain/).

---

## 📚 Documentação Adicional

- [Checklist de Testes Manuais](./TESTING.md)
- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🐛 Troubleshooting

### Erro de Login
- Verifique se o email está confirmado
- Limpe cache e cookies
- Verifique console do navegador

### Erro ao Criar Evento
- Verifique se você criou categorias primeiro
- Confirme que o cliente existe
- Veja logs de rede no DevTools

### Erro de Permissão (RLS)
- Faça logout e login novamente
- Verifique se seu usuário tem role correto
- Contate administrador do sistema

### Performance Lenta
- Limpe cache do navegador
- Verifique sua conexão de internet
- Reduza número de abas abertas

---

## 🤝 Contribuindo

### Workflow

1. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
2. Faça commit das mudanças: `git commit -m 'Adiciona nova feature'`
3. Push para a branch: `git push origin feature/nova-feature`
4. Abra um Pull Request

### Convenções

- **Commits**: Use mensagens descritivas em português
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Code Style**: Prettier + ESLint
- **Testes**: Execute testes manuais antes do PR

---

## 📝 Changelog

### Sprint 2 (Atual)
- ✅ Error Boundary global
- ✅ Tratamento robusto de erros de API
- ✅ README completo
- ✅ Checklist de testes manuais

### Sprint 1
- ✅ Remoção de console.logs sensíveis
- ✅ Proteção anti-bot (honeypot)
- ✅ Validação de CPF/CNPJ

### MVP
- ✅ Autenticação de usuários
- ✅ CRUD de clientes
- ✅ CRUD de eventos
- ✅ Gestão de demandas
- ✅ Controle de estoque
- ✅ Módulo financeiro
- ✅ Contratos e propostas
- ✅ Transportadoras
- ✅ Cadastro público de eventos

---

## 📧 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Entre em contato via Lovable
- Consulte a documentação

---

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando Lovable**
