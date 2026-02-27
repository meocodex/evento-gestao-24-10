

# Fix: CPF validation error when granting system access

## Problem

When granting system access to an operational team member who has no CPF registered, the `criar-operador` edge function returns a 400 error because:

1. The frontend's `limparFormatacao` converts `undefined`/empty CPF to `''` (empty string)
2. The edge function's Zod schema requires CPF to match `/^\d{11}$/` -- an empty string fails this validation
3. CPF is optional for operational members, so the function should accept missing CPF gracefully

## Solution

Two changes:

### 1. Edge Function (`supabase/functions/criar-operador/index.ts`)

Change the `cpf` field in the Zod schema from:
```
cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional()
```
to also allow empty strings and transform them to `undefined`:
```
cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional()
    .or(z.literal('').transform(() => undefined))
```

### 2. Frontend (`src/components/equipe/ConcederAcessoSistemaSheet.tsx`)

Change the body sent to the edge function so that CPF is only included when it actually has a value:

```
cpf: limparFormatacao(membro.cpf) || undefined
```

This ensures empty strings are never sent as CPF, making the fix robust on both sides.

## Files to modify
- `supabase/functions/criar-operador/index.ts` (line 12 -- Zod schema for cpf)
- `src/components/equipe/ConcederAcessoSistemaSheet.tsx` (line 131 -- body payload)

