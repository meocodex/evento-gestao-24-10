# 📱 WhatsApp Business API - Guia de Integração

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração Meta Business](#configuração-meta-business)
4. [Obtenção de Credenciais](#obtenção-de-credenciais)
5. [Criação de Templates](#criação-de-templates)
6. [Configuração do Webhook](#configuração-do-webhook)
7. [Secrets do Sistema](#secrets-do-sistema)
8. [Testes](#testes)
9. [Troubleshooting](#troubleshooting)
10. [Boas Práticas](#boas-práticas)

---

## Visão Geral

Esta integração permite ao sistema enviar mensagens automáticas via WhatsApp Business API para:
- ✅ Confirmar agendamentos com botões interativos
- 📄 Enviar termos de entrega de materiais (PDF)
- 💰 Enviar relatórios de fechamento financeiro (PDF)

**Arquitetura**:
```
Frontend (React) → Edge Function (send-whatsapp) → WhatsApp API → Cliente
                                                                      ↓
Frontend (React) ← Database ← Edge Function (whatsapp-webhook) ← WhatsApp API
```

---

## Pré-requisitos

### 1. Conta Meta Business
- Ter uma conta Meta Business Manager ativa
- Acesso ao Meta Developers (developers.facebook.com)

### 2. Número de Telefone Business
- Número de telefone válido para WhatsApp Business
- Não pode estar cadastrado em WhatsApp pessoal
- Recomendado: número dedicado apenas para business

### 3. Aplicação Meta Developers
- Criar aplicação no Meta Developers
- Adicionar produto "WhatsApp"

---

## Configuração Meta Business

### Passo 1: Criar Aplicação

1. Acesse [Meta Developers](https://developers.facebook.com/)
2. Clique em "Meus Aplicativos" → "Criar Aplicativo"
3. Selecione tipo: "Empresa"
4. Preencha:
   - Nome do aplicativo: `[Seu Sistema] - WhatsApp`
   - Email de contato
   - Conta comercial (Business Manager)
5. Clique em "Criar Aplicativo"

### Passo 2: Adicionar WhatsApp

1. No dashboard do aplicativo, procure "WhatsApp"
2. Clique em "Configurar" no card WhatsApp
3. Siga o wizard de configuração:
   - Selecione ou crie perfil comercial
   - Adicione número de telefone
   - Verifique número via SMS/chamada

### Passo 3: Obter Número de Teste (Opcional)

Para desenvolvimento:
1. Na seção "WhatsApp" → "Primeiros passos"
2. Use o "Número de teste fornecido pela Meta"
3. Adicione números de celular para testes
4. **Nota**: Número de teste tem limitações (5 destinatários)

---

## Obtenção de Credenciais

### 1. Access Token (Permanente)

**Token Temporário (24h)**:
1. Vá em "WhatsApp" → "Primeiros passos"
2. Copie o "Token de acesso temporário"
3. ⚠️ **Não usar em produção** - expira em 24h

**Token Permanente (Recomendado)**:
1. Vá em "WhatsApp" → "Configuração" → "Configuração da API"
2. Ou: Configurações do Aplicativo → Básico → Tokens de acesso
3. Clique em "Criar token de acesso do sistema"
4. Selecione permissões:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management` (opcional)
5. Defina validade: "Nunca expira" ou período longo
6. Copie e guarde o token de forma segura
7. ✅ Este é o `WHATSAPP_ACCESS_TOKEN`

### 2. Phone Number ID

1. Na seção "WhatsApp" → "Primeiros passos"
2. Procure por "Enviar e receber mensagens"
3. Copie o número que aparece como "ID do número de telefone"
4. Exemplo: `123456789012345`
5. ✅ Este é o `WHATSAPP_PHONE_ID`

### 3. Verify Token (Webhook)

1. Este token você mesmo define
2. Recomendação: string aleatória segura
3. Exemplo: `meu_token_seguro_webhook_2025`
4. ✅ Este é o `WHATSAPP_VERIFY_TOKEN`
5. **Importante**: Guarde para configurar o webhook

---

## Criação de Templates

Templates devem ser criados na plataforma Meta e aprovados antes do uso.

### Acesso ao Gerenciador de Templates

**Opção 1 - Via Meta Business Suite**:
1. Acesse [business.facebook.com](https://business.facebook.com)
2. Menu → "Conta WhatsApp" → "Modelos de mensagem"

**Opção 2 - Via Meta Developers**:
1. No aplicativo, vá em "WhatsApp" → "Modelos de mensagem"

### Template 1: Confirmação de Agendamento (Botões)

**Configurações**:
- **Nome**: `confirmacao_evento`
- **Categoria**: UTILITY
- **Idiomas**: Português (Brasil) - pt_BR

**Cabeçalho** (opcional):
```
Confirmação de Agendamento
```

**Corpo**:
```
Olá! Confirmamos o agendamento do seu evento:

📅 Evento: {{1}}
📆 Data: {{2}}
⏰ Horário: {{3}}
📍 Local: {{4}}

Por favor, confirme o agendamento clicando em um dos botões abaixo:
```

**Botões**:
- Tipo: Quick Reply
- Botão 1: `Confirmar`
- Botão 2: `Cancelar`

**Variáveis**:
1. `{{1}}` = Nome do evento
2. `{{2}}` = Data (formato DD/MM/YYYY)
3. `{{3}}` = Horário (formato HH:MM)
4. `{{4}}` = Local (Cidade - Estado)

### Template 2: Termo de Entrega (Documento)

**Configurações**:
- **Nome**: `termo_entrega`
- **Categoria**: UTILITY
- **Idiomas**: pt_BR

**Cabeçalho**:
- Tipo: DOCUMENT

**Corpo**:
```
Segue o Termo de Entrega dos materiais para o evento {{1}}.

📅 Data de entrega: {{2}}

Por favor, revise o documento anexo e confirme o recebimento dos materiais.
```

**Variáveis**:
1. `{{1}}` = Nome do evento
2. `{{2}}` = Data de entrega

### Template 3: Fechamento de Evento (Documento)

**Configurações**:
- **Nome**: `fechamento_evento`
- **Categoria**: UTILITY
- **Idiomas**: pt_BR

**Cabeçalho**:
- Tipo: DOCUMENT

**Corpo**:
```
Relatório de Fechamento - Evento {{1}}

Segue anexo o relatório completo de fechamento financeiro e operacional do evento.

Agradecemos a parceria!
```

**Variáveis**:
1. `{{1}}` = Nome do evento

### Processo de Aprovação

1. Após criar o template, clique em "Enviar"
2. Meta analisará o template (geralmente 1-24 horas)
3. Status possíveis:
   - ✅ **APPROVED**: Pronto para uso
   - ⏳ **PENDING**: Em análise
   - ❌ **REJECTED**: Rejeitado (veja motivo e corrija)

**Dicas para Aprovação**:
- Seja claro e objetivo no conteúdo
- Evite linguagem promocional excessiva
- Use categoria correta (UTILITY para transacionais)
- Não incluir links externos no corpo

---

## Configuração do Webhook

### 1. URL do Webhook

Sua URL será:
```
https://oizymmjlgmwiuevksxos.supabase.co/functions/v1/whatsapp-webhook
```

### 2. Configurar na Meta

1. Vá em "WhatsApp" → "Configuração" → "Configuração da API"
2. Procure seção "Webhooks"
3. Clique em "Configurar webhooks"
4. Preencha:
   - **URL de retorno de chamada**: Cole a URL acima
   - **Verificar token**: Cole o `WHATSAPP_VERIFY_TOKEN` que você definiu
5. Clique em "Verificar e salvar"

### 3. Inscrever em Eventos

Após verificação bem-sucedida:
1. Na seção "Webhook", clique em "Gerenciar"
2. Encontre "WhatsApp Business Account"
3. Clique em "Inscrever"
4. Selecione os eventos:
   - ✅ `messages` - Mensagens recebidas
   - ✅ `messages_status` - Status de entrega (opcional)

### 4. Teste de Verificação

O webhook implementa o handshake do Meta:
```javascript
// GET /whatsapp-webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=seu_token
// Responde com hub.challenge se verify_token estiver correto
```

Se a verificação falhar:
- Verifique se o `WHATSAPP_VERIFY_TOKEN` está correto no sistema
- Verifique logs da edge function `whatsapp-webhook`
- URL deve ser HTTPS

---

## Secrets do Sistema

### 1. Adicionar Secrets no Sistema

No sistema, você precisará adicionar os 3 secrets obtidos:

1. `WHATSAPP_ACCESS_TOKEN` = Token permanente da Meta
2. `WHATSAPP_PHONE_ID` = ID do número de telefone
3. `WHATSAPP_VERIFY_TOKEN` = Token de verificação do webhook

**Como adicionar**:
- Via interface do sistema (Settings → Secrets)
- Ou através do AI Agent quando solicitado

### 2. Verificar Secrets

Após adicionar, verifique se estão configurados:
```sql
-- No banco de dados
SELECT name FROM vault.secrets WHERE name LIKE 'WHATSAPP_%';
```

---

## Testes

### Teste 1: Envio de Confirmação com Botões

```bash
# Via curl
curl -X POST \
  https://oizymmjlgmwiuevksxos.supabase.co/functions/v1/send-whatsapp \
  -H "Authorization: Bearer [SEU_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "type": "interactive",
    "evento_id": "uuid-do-evento",
    "template_name": "confirmacao_evento",
    "variables": {
      "nome_evento": "Teste de Evento",
      "data": "15/01/2025",
      "horario": "19:00",
      "local": "São Paulo - SP"
    }
  }'
```

**Resultado esperado**:
- Mensagem recebida no WhatsApp do destinatário
- Botões "Confirmar" e "Cancelar" visíveis
- Registro criado na tabela `confirmacoes_whatsapp`

### Teste 2: Resposta de Botão

1. Abra WhatsApp no celular
2. Receba a mensagem de teste
3. Clique em "Confirmar"
4. Verifique no sistema:
   - Status do registro em `confirmacoes_whatsapp` mudou para "confirmado"
   - Timeline do evento foi atualizada

### Teste 3: Envio de Documento PDF

```bash
curl -X POST \
  https://oizymmjlgmwiuevksxos.supabase.co/functions/v1/send-whatsapp \
  -H "Authorization: Bearer [SEU_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "type": "document",
    "template_name": "termo_entrega",
    "document_url": "https://seu-storage.com/documento.pdf",
    "variables": {
      "nome_evento": "Teste de Evento",
      "data_entrega": "15/01/2025"
    }
  }'
```

---

## Troubleshooting

### Erro: "Template not found"

**Causa**: Template não existe ou não está aprovado.

**Solução**:
1. Verifique se criou o template na Meta
2. Confirme status = APPROVED
3. Verifique o nome exato do template (case-sensitive)

### Erro: "Invalid phone number"

**Causa**: Formato incorreto do número.

**Solução**:
- Use formato internacional: `+5511999999999`
- Inclua código do país (+55 para Brasil)
- Sem espaços, parênteses ou traços

### Erro: "Access token expired"

**Causa**: Token temporário expirou (24h).

**Solução**:
- Crie token permanente conforme seção "Obtenção de Credenciais"
- Atualize `WHATSAPP_ACCESS_TOKEN` no sistema

### Webhook não recebe callbacks

**Causa**: URL incorreta ou não verificada.

**Solução**:
1. Verifique URL do webhook na Meta
2. Confirme que `WHATSAPP_VERIFY_TOKEN` está correto
3. Teste endpoint manualmente:
```bash
curl "https://sua-url/whatsapp-webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=seu_token"
```
4. Verifique logs da edge function

### Erro: "Rate limit exceeded"

**Causa**: Muitas mensagens em curto período.

**Solução**:
- WhatsApp limita mensagens por segundo
- Implemente queue/throttling
- Aguarde alguns minutos antes de retentar

### Templates rejeitados pela Meta

**Causas comuns**:
- Categoria incorreta (use UTILITY para transacionais)
- Conteúdo promocional excessivo
- Links externos no corpo
- Informações de contato inválidas

**Solução**:
1. Leia o motivo da rejeição na Meta
2. Ajuste o template conforme feedback
3. Reenvie para aprovação

---

## Boas Práticas

### 1. Gerenciamento de Templates

- ✅ Crie templates reutilizáveis e genéricos
- ✅ Use variáveis para personalização dinâmica
- ✅ Mantenha biblioteca de templates aprovados
- ❌ Não crie templates muito específicos

### 2. Envio de Mensagens

- ✅ Valide número de telefone antes de enviar
- ✅ Implemente retry com backoff exponencial
- ✅ Registre todas as tentativas de envio
- ❌ Não envie spam ou mensagens não solicitadas

### 3. Webhooks

- ✅ Responda rapidamente (< 5 segundos)
- ✅ Processe callbacks de forma assíncrona
- ✅ Implemente idempotência (mesma mensagem pode chegar 2x)
- ❌ Não faça processamento pesado síncrono

### 4. Segurança

- ✅ Mantenha tokens seguros (não commitar no código)
- ✅ Use HTTPS sempre
- ✅ Valide signature dos webhooks (se implementado)
- ❌ Não exponha credenciais em logs

### 5. Monitoramento

- ✅ Monitore taxa de sucesso de envios
- ✅ Acompanhe taxa de resposta de botões
- ✅ Configure alertas para erros críticos
- ✅ Analise logs regularmente

### 6. Conformidade

- ✅ Obtenha opt-in dos clientes para WhatsApp
- ✅ Permita opt-out fácil
- ✅ Respeite horários comerciais
- ✅ Siga políticas do WhatsApp Business

---

## Limites e Restrições

### Rate Limits

| Tier | Mensagens/Dia | Nota |
|------|---------------|------|
| Tier 1 | 1.000 | Conta nova |
| Tier 2 | 10.000 | Após aprovação |
| Tier 3 | 100.000 | Mediante solicitação |

**Como aumentar tier**:
- Mantenha qualidade alta (baixa taxa de bloqueio)
- Solicite aumento via Meta Business Manager
- Aguarde aprovação (geralmente 7 dias)

### Janela de Mensagem (24h)

- Mensagens com templates: Sem limite de tempo
- Mensagens abertas: Apenas dentro de 24h da última resposta do cliente

### Tipos de Mídia Suportados

- Documentos: PDF, DOC, DOCX (máx 100MB)
- Imagens: JPG, PNG (máx 5MB)
- Vídeos: MP4 (máx 16MB)
- Áudio: MP3, AAC (máx 16MB)

---

## Referências

- [WhatsApp Business API - Documentação Oficial](https://developers.facebook.com/docs/whatsapp)
- [Cloud API - Guia de Início Rápido](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Templates de Mensagem](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)

---

## Suporte

Para problemas com a integração:
1. Verifique logs das edge functions (send-whatsapp, whatsapp-webhook)
2. Consulte esta documentação
3. Verifique configurações na Meta Business Manager
4. Entre em contato com equipe de desenvolvimento
