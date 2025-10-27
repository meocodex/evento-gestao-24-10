/**
 * Helpers para conversão de status de estoque entre UI e Database
 * UI usa "em-uso" (com hífen)
 * DB usa "em_uso" (com underscore)
 */

export type StatusUI = 'disponivel' | 'em-uso' | 'manutencao';
export type StatusDB = 'disponivel' | 'em_uso' | 'manutencao';

export const uiToDbStatus = (status: StatusUI): StatusDB => {
  return status === 'em-uso' ? 'em_uso' : status;
};

export const dbToUiStatus = (status: StatusDB): StatusUI => {
  return status === 'em_uso' ? 'em-uso' : status;
};
