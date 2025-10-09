import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Search, Plus, Filter } from 'lucide-react';

const mockEventos = [
  {
    id: 1,
    nome: 'Festa de Aniversário',
    data: '15/10/2025',
    local: 'Buffet Estrela - Cuiabá/MT',
    cliente: 'João da Silva Santos',
    comercial: 'Maria Santos',
    status: 'confirmado',
    tag: 'Bar',
  },
  {
    id: 2,
    nome: 'Show Musical',
    data: '18/10/2025',
    local: 'Arena Central - São Paulo/SP',
    cliente: 'Eventos MK Ltda',
    comercial: 'Maria Santos',
    status: 'materiais_alocados',
    tag: 'Ingressos',
  },
  {
    id: 3,
    nome: 'Evento Corporativo',
    data: '22/10/2025',
    local: 'Hotel Premium - Rio de Janeiro/RJ',
    cliente: 'Tech Solutions CNPJ',
    comercial: 'Maria Santos',
    status: 'aguardando_alocacao',
    tag: 'Corporativo',
  },
];

const statusConfig = {
  orcamento_enviado: { label: 'Orçamento Enviado', color: 'bg-yellow-500' },
  confirmado: { label: 'Confirmado', color: 'bg-green-500' },
  materiais_alocados: { label: 'Materiais Alocados', color: 'bg-blue-500' },
  em_preparacao: { label: 'Em Preparação', color: 'bg-purple-500' },
  em_andamento: { label: 'Em Andamento', color: 'bg-gray-800' },
  aguardando_retorno: { label: 'Aguardando Retorno', color: 'bg-orange-500' },
  aguardando_fechamento: { label: 'Aguardando Fechamento', color: 'bg-gray-400' },
  finalizado: { label: 'Finalizado', color: 'bg-green-600' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500' },
  aguardando_alocacao: { label: 'Aguardando Alocação', color: 'bg-yellow-600' },
};

const Eventos = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Eventos</h2>
          <p className="text-muted-foreground mt-1">Gerencie todos os eventos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar eventos..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="grid gap-4">
        {mockEventos.map((evento) => (
          <Card key={evento.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{evento.nome}</h3>
                    <Badge className={statusConfig[evento.status as keyof typeof statusConfig].color}>
                      {statusConfig[evento.status as keyof typeof statusConfig].label}
                    </Badge>
                    <Badge variant="outline">{evento.tag}</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{evento.data}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{evento.local}</span>
                    </div>
                  </div>

                  <div className="flex gap-6 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="text-sm font-medium">{evento.cliente}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Comercial</p>
                      <p className="text-sm font-medium">{evento.comercial}</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Eventos;
