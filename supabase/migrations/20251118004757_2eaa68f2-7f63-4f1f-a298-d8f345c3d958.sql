-- Atualizar policies da tabela equipe_operacional para aceitar admin.full_access

-- Policy de gerenciamento (ALL)
DROP POLICY IF EXISTS "Users with permission can manage equipe_operacional" ON public.equipe_operacional;
CREATE POLICY "Users with permission can manage equipe_operacional" 
ON public.equipe_operacional
FOR ALL
USING (
  has_permission(auth.uid(), 'equipe.editar') OR
  has_permission(auth.uid(), 'admin.full_access')
)
WITH CHECK (
  has_permission(auth.uid(), 'equipe.editar') OR
  has_permission(auth.uid(), 'admin.full_access')
);

-- Policy de visualização (SELECT)
DROP POLICY IF EXISTS "Users with permission can view equipe_operacional" ON public.equipe_operacional;
CREATE POLICY "Users with permission can view equipe_operacional"
ON public.equipe_operacional
FOR SELECT
USING (
  has_permission(auth.uid(), 'equipe.visualizar') OR
  has_permission(auth.uid(), 'equipe.editar') OR
  has_permission(auth.uid(), 'admin.full_access')
);