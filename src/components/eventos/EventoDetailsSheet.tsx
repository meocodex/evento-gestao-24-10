import { Evento } from '@/types/eventos';
import { DetailsSheet, SheetTab } from '@/components/shared/sheets';
import { usePermissions } from '@/hooks/usePermissions';
import { DadosEvento } from './secoes/DadosEvento';
import { MateriaisEvento } from './secoes/MateriaisEvento';
import { OperacaoEvento } from './secoes/OperacaoEvento';
import { FinanceiroEvento } from './secoes/FinanceiroEvento';
import { DemandasEvento } from './secoes/DemandasEvento';
import { ContratosEvento } from './secoes/ContratosEvento';

interface EventoDetailsSheetProps {
  evento: Evento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventoDetailsSheet({ evento, open, onOpenChange }: EventoDetailsSheetProps) {
  const permissions = usePermissions(evento || undefined);

  if (!evento) return null;

  const tabs: SheetTab[] = [
    {
      value: 'dados',
      label: 'Dados',
      content: <DadosEvento evento={evento} permissions={permissions} />
    },
    {
      value: 'materiais',
      label: 'Materiais',
      content: <MateriaisEvento evento={evento} permissions={permissions} />
    },
    {
      value: 'operacao',
      label: 'Operação',
      content: <OperacaoEvento evento={evento} permissions={permissions} />
    },
    {
      value: 'demandas',
      label: 'Demandas',
      content: <DemandasEvento eventoId={evento.id} />
    },
    {
      value: 'financeiro',
      label: 'Financeiro',
      content: <FinanceiroEvento evento={evento} permissions={permissions} />,
      disabled: !permissions.isLoading && !permissions.canViewFinancial
    },
    {
      value: 'contratos',
      label: 'Contratos',
      content: <ContratosEvento evento={evento} />
    }
  ];

  return (
    <DetailsSheet
      open={open}
      onOpenChange={onOpenChange}
      title={evento.nome}
      tabs={tabs}
      defaultTab="dados"
      size="xl"
    />
  );
}
