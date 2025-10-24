import { useState } from 'react';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoTimeline } from '@/components/shared/EventoTimeline';
import { Calendar, MapPin, User, Building2, Mail, Phone, Edit, Trash2, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react';
import { FileViewer } from '@/components/shared/FileViewer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarDadosEvento } from './EditarDadosEvento';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { useEventos } from '@/hooks/eventos';
import { AlterarStatusDialog } from '../modals/AlterarStatusDialog';

interface DadosEventoProps {
  evento: Evento;
  permissions: any;
}

export function DadosEvento({ evento, permissions }: DadosEventoProps) {
  const { editarEvento, excluirEvento, alterarStatus } = useEventos();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; nome: string; tipo: string } | null>(null);

  const handleSave = async (data: Partial<Evento>) => {
    await editarEvento.mutateAsync({ id: evento.id, data });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await excluirEvento.mutateAsync(evento.id);
    setShowDeleteDialog(false);
  };

  const handleStatusChange = async (novoStatus: any, observacao?: string) => {
    await alterarStatus.mutateAsync({ id: evento.id, novoStatus, observacao });
  };

  if (isEditing) {
    return <EditarDadosEvento evento={evento} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informações do Evento</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStatusDialog(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Alterar Status
            </Button>
            {permissions.canEdit && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {permissions.canDeleteEvent && (
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data e Horário</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })} às {evento.horaInicio}
                  {' → '}
                  {format(new Date(evento.dataFim), "dd/MM/yyyy", { locale: ptBR })} às {evento.horaFim}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Local</p>
                <p className="text-sm text-muted-foreground">{evento.local}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <StatusBadge status={evento.status} />
          </div>
          {evento.descricao && (
            <div>
              <p className="text-sm font-medium mb-1">Descrição</p>
              <p className="text-sm text-muted-foreground">{evento.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {evento.cliente.tipo === 'CPF' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            <div>
              <p className="font-medium">{evento.cliente.nome}</p>
              <p className="text-sm text-muted-foreground">{evento.cliente.documento}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>{evento.cliente.telefone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            <span>{evento.cliente.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Documentos e Mídias */}
      {(evento.documentos?.length > 0 || evento.plantaBaixa || evento.fotosEvento?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos e Mídias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evento.plantaBaixa && (
              <div>
                <p className="text-sm font-medium mb-2">Planta Baixa</p>
                <button
                  onClick={() => {
                    setSelectedFile({ 
                      url: evento.plantaBaixa!, 
                      nome: 'Planta Baixa', 
                      tipo: evento.plantaBaixa!.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' 
                    });
                    setFileViewerOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Visualizar Planta Baixa
                </button>
              </div>
            )}

            {evento.documentos?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Documentos ({evento.documentos.length})</p>
                <div className="space-y-2">
                  {evento.documentos.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedFile({ 
                          url: doc, 
                          nome: `Documento-${idx + 1}`, 
                          tipo: doc.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' 
                        });
                        setFileViewerOpen(true);
                      }}
                      className="flex items-center gap-2 text-sm text-primary hover:underline w-full text-left"
                    >
                      <FileText className="h-4 w-4" />
                      Documento {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {evento.fotosEvento?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Fotos do Evento ({evento.fotosEvento.length})</p>
                <div className="grid grid-cols-4 gap-2">
                  {evento.fotosEvento.map((foto, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedFile({ 
                          url: foto, 
                          nome: `Foto-${idx + 1}`, 
                          tipo: 'image/jpeg' 
                        });
                        setFileViewerOpen(true);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                    >
                      <img 
                        src={foto} 
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <EventoTimeline timeline={evento.timeline} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Excluir Evento"
        description="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
      />

      <AlterarStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        statusAtual={evento.status}
        onAlterar={handleStatusChange}
      />

      {selectedFile && (
        <FileViewer
          isOpen={fileViewerOpen}
          onClose={() => {
            setFileViewerOpen(false);
            setSelectedFile(null);
          }}
          fileUrl={selectedFile.url}
          fileName={selectedFile.nome}
          fileType={selectedFile.tipo}
        />
      )}
    </div>
  );
}
