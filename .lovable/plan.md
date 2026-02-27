

# Fix: Duplicate permission constraint error in criar-operador

## Problem

When creating a new user with the 'admin' role, the database trigger `grant_all_permissions_to_admin` automatically inserts all permissions for the user. Then the edge function also tries to insert the same permissions, causing a `duplicate key` violation on `user_permissions_user_id_permission_id_key`.

## Solution

Update the `criar-operador` edge function to use **upsert** (`ON CONFLICT DO NOTHING` equivalent) when inserting permissions. This is done by passing `{ onConflict: 'user_id,permission_id' }` to the Supabase `.upsert()` call instead of `.insert()` for the `user_permissions` table.

This applies to both code paths:
1. **Existing user** update flow (around line 131)
2. **New user** creation flow (around line 207)

## File changed

- `supabase/functions/criar-operador/index.ts` -- Change `.insert(userPermissions)` to `.upsert(userPermissions, { onConflict: 'user_id,permission_id', ignoreDuplicates: true })` in both locations where permissions are inserted.

## Why this is safe

- `upsert` with `ignoreDuplicates` silently skips rows that already exist, which is the correct behavior since the trigger already granted the permissions
- The post-insertion count validation still works because it counts total permissions regardless of how they were inserted
- No database migration needed

