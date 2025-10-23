# Estratégia de Cache - React Query

## Configuração Global (AppProviders)

```typescript
staleTime: 5 minutos   // Dados considerados "frescos"
gcTime: 30 minutos     // Dados inativos permanecem em cache
retry: 1               // Uma tentativa de retry
refetchOnWindowFocus: false  // Evita refetches desnecessários
```

## Overrides por Recurso

### Dados Altamente Voláteis (mudanças frequentes)
**staleTime: 2-3 minutos | gcTime: 15-20 minutos**

- ✅ **Cadastros Pendentes** (2 min) - Aguardam aprovação constantemente
- ✅ **Demandas** (3 min) - Status muda frequentemente
- ✅ **Detalhes de Evento** (3 min) - Muitas atualizações durante operação

### Dados Moderadamente Voláteis
**staleTime: 5 minutos | gcTime: 30 minutos** (usa padrão global)

- ✅ **Eventos** (5 min) - Lista muda com frequência moderada
- ✅ **Estoque** (5 min) - Alocações e devoluções constantes
- ✅ **Seriais** (5 min) - Status muda com uso

### Dados Relativamente Estáveis
**staleTime: 10-15 minutos | gcTime: 30-60 minutos**

- ✅ **Clientes** (15 min) - Cadastros mudam raramente
- ✅ **Equipe Operacional** (30 min) - Lista estável
- ✅ **Profiles** (5 min) - Atualizações pontuais

### Dados Muito Estáveis
**staleTime: 30 minutos | gcTime: 1 hora**

- ✅ **Contratos/Templates** (30 min) - Estruturas fixas
- ✅ **Transportadoras** (30 min) - Cadastros raramente mudam
- ✅ **Configurações** (60 min) - Mudanças esporádicas

## Princípios

1. **Dados mais voláteis = menor staleTime**
   - Garante refetch mais frequente
   - Usuários veem dados atualizados

2. **gcTime proporcional ao staleTime**
   - Dados voláteis: gcTime = 3-5x staleTime
   - Dados estáveis: gcTime = 2-4x staleTime

3. **Invalidação Manual é Chave**
   - Mutations sempre invalidam queries relacionadas
   - `queryClient.invalidateQueries()` após cada operação

4. **Cache Local Persistente**
   - Dados persistem entre sessões
   - Reduz carregamento inicial
   - Sincroniza com `refetchOnReconnect`

## Quando Ajustar

- **Reduzir staleTime**: Se usuários reportam dados desatualizados
- **Aumentar staleTime**: Se há muitos refetches desnecessários
- **Aumentar gcTime**: Para melhorar performance de navegação
- **Reduzir gcTime**: Se memória for uma preocupação
