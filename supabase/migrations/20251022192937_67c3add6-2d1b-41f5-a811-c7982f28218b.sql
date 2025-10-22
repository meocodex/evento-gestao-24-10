-- Remover política problemática que causa deadlock
DROP POLICY IF EXISTS "Admins with permission can manage user permissions" ON user_permissions;

-- Criar nova política baseada em ROLE ao invés de PERMISSION
-- Isso permite que admins gerenciem permissões sem precisar ter a permissão primeiro
CREATE POLICY "Admins can manage all user permissions"
ON user_permissions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));