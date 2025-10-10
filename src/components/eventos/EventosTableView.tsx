import { Evento } from '@/types/eventos';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventosTableViewProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
}

export function EventosTableView({ eventos, onViewDetails }: EventosTableViewProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Evento</TableHead>
            <TableHead className="font-semibold hidden md:table-cell">Cliente</TableHead>
            <TableHead className="font-semibold hidden lg:table-cell">Data</TableHead>
            <TableHead className="font-semibold hidden xl:table-cell">Cidade</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventos.map((evento) => (
            <TableRow
              key={evento.id}
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => onViewDetails(evento)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-semibold">{evento.nome}</span>
                  <span className="text-xs text-muted-foreground md:hidden">
                    {evento.cliente.nome}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{evento.cliente.nome}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(parseISO(evento.dataInicio), "dd 'de' MMM", { locale: ptBR })}
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {evento.cidade}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={evento.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(evento);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}