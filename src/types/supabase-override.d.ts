// Override temporário para resolver problema de tipos vazios do Supabase
// Este arquivo força o cliente Supabase a ser tratado como 'any' até que
// src/integrations/supabase/types.ts seja regenerado automaticamente

declare module '@/integrations/supabase/client' {
  export const supabase: any;
}
