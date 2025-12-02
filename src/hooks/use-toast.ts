/**
 * Compatibility layer - redirects to sonner
 * This file exists for backward compatibility during migration.
 * All new code should import directly from 'sonner'.
 */
import { toast as sonnerToast } from 'sonner';

// Adapter function that converts old toast API to sonner API
function toast(props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) {
  const { title, description, variant } = props;
  const message = title || '';
  const options = description ? { description } : undefined;
  
  if (variant === 'destructive') {
    return sonnerToast.error(message, options);
  }
  return sonnerToast.success(message, options);
}

// Hook that returns the toast function (for components using useToast pattern)
function useToast() {
  return { toast };
}

export { useToast, toast };
