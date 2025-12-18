/**
 * Helpers para conversão de status de estoque entre UI e Database
 * UI usa "em-uso" (com hífen)
 * DB usa "em_uso" (com underscore)
 */

export type StatusUI = 'disponivel' | 'em-uso' | 'manutencao' | 'perdido' | 'consumido';
export type StatusDB = 'disponivel' | 'em_uso' | 'manutencao' | 'perdido' | 'consumido';
export type StatusSerialDB = StatusDB;

export const uiToDbStatus = (status: StatusUI): StatusDB => {
  return status === 'em-uso' ? 'em_uso' : status;
};

export const dbToUiStatus = (status: StatusDB): StatusUI => {
  return status === 'em_uso' ? 'em-uso' : status;
};

export const statusConfig = {
  disponivel: { label: 'Disponível', color: 'success' },
  'em-uso': { label: 'Em Uso', color: 'default' },
  manutencao: { label: 'Manutenção', color: 'warning' },
  perdido: { label: 'Perdido', color: 'destructive' },
  consumido: { label: 'Consumido', color: 'secondary' },
} as const;
