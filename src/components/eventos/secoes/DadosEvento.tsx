import { useState } from 'react';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoTimeline } from '@/components/shared/EventoTimeline';
import { Calendar, MapPin, User, Building2, Mail, Phone, Edit, Trash2, RefreshCw, FileText, Archive, CreditCard } from 'lucide-react';
import { FileViewer } from '@/components/shared/FileViewer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarDadosEvento } from './EditarDadosEvento';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { useEventos } from '@/hooks/eventos';
import { AlterarStatusDialog } from '../modals/AlterarStatusDialog';
import { ArquivarEventoDialog } from '../modals/ArquivarEventoDialog';
import { MateriaisPendentesBadge } from '../MateriaisPendentesBadge';
import { useMaterialPendente } from '@/hooks/eventos/useMaterialPendente';
import { EventoCountdown } from '../EventoCountdown';
import { InfoGridList } from '@/components/shared/InfoGrid';
import { Separator } from '@/components/ui/separator';

interface DadosEventoProps {
  evento: Evento;
  permissions: any;
}

export function DadosEvento({ evento, permissions }: DadosEventoProps) {
  const { editarEvento, excluirEvento, alterarStatus, arquivarEvento } = useEventos();
  const { data: pendentes } = useMaterialPendente(evento.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showArquivarDialog, setShowArquivarDialog] = useState(false);
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

  const handleArquivar = async () => {
    await arquivarEvento.mutateAsync(evento.id);
    setShowArquivarDialog(false);
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
            {permissions.canEditEvent(evento) && (
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
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Endereço do Evento</p>
                <p className="text-sm text-muted-foreground">{evento.endereco}</p>
                <p className="text-sm text-muted-foreground">
                  {evento.cidade}/{evento.estado}
                </p>
              </div>
            </div>
          </div>

          {evento.tags && evento.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {evento.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {evento.contatosAdicionais && (
            <div>
              <p className="text-sm font-medium mb-1">Contatos Adicionais</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {evento.contatosAdicionais}
              </p>
            </div>
          )}

          {evento.redesSociais && (
            <div>
              <p className="text-sm font-medium mb-1">Redes Sociais</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {evento.redesSociais}
              </p>
            </div>
          )}
          
          {/* Contador Regressivo */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <EventoCountdown dataInicio={evento.dataInicio} horaInicio={evento.horaInicio} status={evento.status} />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <div className="flex items-center flex-wrap gap-2">
              <StatusBadge status={evento.status} />
              {evento.utilizaPosEmpresa && (
                <Badge variant="secondary" className="gap-1">
                  <CreditCard className="h-3 w-3" />
                  POS Empresa
                </Badge>
              )}
              <MateriaisPendentesBadge eventoId={evento.id} status={evento.status} />
              {evento.status === 'finalizado' && !evento.arquivado && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pendentes?.temPendentes}
                  onClick={() => setShowArquivarDialog(true)}
                  title={pendentes?.temPendentes ? 'Devolva todos os materiais antes de arquivar' : 'Arquivar evento'}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar Evento
                </Button>
              )}
              {evento.arquivado && (
                <Badge variant="secondary">
                  <Archive className="h-3 w-3 mr-1" />
                  Arquivado
                </Badge>
              )}
            </div>
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
        <CardContent>
          <InfoGridList
            items={[
              {
                icon: evento.cliente.tipo === 'CPF' ? User : Building2,
                label: evento.cliente.tipo === 'CPF' ? 'Cliente (CPF)' : 'Cliente (CNPJ)',
                value: (
                  <>
                    <p className="font-semibold">{evento.cliente.nome}</p>
                    <p className="text-sm text-muted-foreground">{evento.cliente.documento}</p>
                  </>
                ),
              },
              {
                icon: Phone,
                label: 'Telefone',
                value: evento.cliente.telefone,
              },
              ...(evento.cliente.whatsapp && evento.cliente.whatsapp !== evento.cliente.telefone ? [{
                icon: Phone,
                label: 'WhatsApp',
                value: <span className="text-green-600">{evento.cliente.whatsapp}</span>,
              }] : []),
              {
                icon: Mail,
                label: 'Email',
                value: evento.cliente.email,
              },
              {
                icon: MapPin,
                label: 'Endereço',
                value: (
                  <>
                    <p>{evento.cliente.endereco.logradouro}, {evento.cliente.endereco.numero}
                      {evento.cliente.endereco.complemento && ` - ${evento.cliente.endereco.complemento}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {evento.cliente.endereco.bairro} - CEP: {evento.cliente.endereco.cep}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {evento.cliente.endereco.cidade}/{evento.cliente.endereco.estado}
                    </p>
                  </>
                ),
                separator: evento.cliente.tipo === 'CNPJ' && !!evento.cliente.responsavelLegal,
              },
              ...(evento.cliente.tipo === 'CNPJ' && evento.cliente.responsavelLegal ? [{
                icon: User,
                label: 'Responsável Legal',
                value: (
                  <div className="space-y-1">
                    <p><strong>Nome:</strong> {evento.cliente.responsavelLegal.nome}</p>
                    <p><strong>CPF:</strong> {evento.cliente.responsavelLegal.cpf}</p>
                    <p><strong>Data de Nascimento:</strong> {evento.cliente.responsavelLegal.dataNascimento}</p>
                  </div>
                ),
                separator: false,
              }] : []),
            ]}
          />
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

      <ArquivarEventoDialog
        open={showArquivarDialog}
        onOpenChange={setShowArquivarDialog}
        onConfirm={handleArquivar}
        isLoading={arquivarEvento.isPending}
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
