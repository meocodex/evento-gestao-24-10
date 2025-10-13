import { toast } from 'sonner';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Handles API errors and displays user-friendly messages
 */
export function handleApiError(error: any, customMessage?: string): ApiError {
  const apiError: ApiError = {
    message: customMessage || 'Ocorreu um erro. Por favor, tente novamente.',
    code: error?.code,
    status: error?.status,
    details: error,
  };

  // Network errors
  if (!navigator.onLine) {
    apiError.message = 'Sem conexão com a internet. Verifique sua conexão.';
    toast.error(apiError.message);
    return apiError;
  }

  // Supabase specific errors
  if (error?.message) {
    const errorMessage = error.message.toLowerCase();

    // Auth errors
    if (errorMessage.includes('invalid login credentials')) {
      apiError.message = 'Email ou senha incorretos.';
    } else if (errorMessage.includes('user already registered')) {
      apiError.message = 'Este email já está cadastrado.';
    } else if (errorMessage.includes('email not confirmed')) {
      apiError.message = 'Por favor, confirme seu email antes de fazer login.';
    }
    // Network/timeout errors
    else if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
      apiError.message = 'Erro de conexão. Verifique sua internet.';
    }
    // Permission errors
    else if (errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
      apiError.message = 'Você não tem permissão para realizar esta ação.';
    }
    // Validation errors
    else if (errorMessage.includes('violates check constraint') || errorMessage.includes('invalid input')) {
      apiError.message = 'Dados inválidos. Verifique as informações.';
    }
    // Generic database errors
    else if (error.code && error.code.startsWith('PGRST')) {
      apiError.message = 'Erro ao acessar os dados. Tente novamente.';
    }
  }

  // HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        apiError.message = 'Requisição inválida. Verifique os dados.';
        break;
      case 401:
        apiError.message = 'Não autorizado. Faça login novamente.';
        break;
      case 403:
        apiError.message = 'Acesso negado.';
        break;
      case 404:
        apiError.message = 'Recurso não encontrado.';
        break;
      case 408:
        apiError.message = 'Tempo de resposta esgotado. Tente novamente.';
        break;
      case 429:
        apiError.message = 'Muitas requisições. Aguarde um momento.';
        break;
      case 500:
      case 502:
      case 503:
        apiError.message = 'Erro no servidor. Tente novamente mais tarde.';
        break;
    }
  }

  toast.error(apiError.message);
  
  // Log in development
  if (!import.meta.env.PROD) {
    console.error('API Error:', apiError);
  }

  return apiError;
}

/**
 * Wraps async functions to handle errors automatically
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  customMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleApiError(error, customMessage);
    return null;
  }
}
