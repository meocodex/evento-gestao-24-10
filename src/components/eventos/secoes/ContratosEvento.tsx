import { useState, useRef } from 'react';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEventoContratos } from '@/hooks/useEventoContratos';
import { gerarContratoFromModelo } from '@/lib/modelos-contrato';
import { TipoContratoEvento, TIPO_CONTRATO_LABELS, ContratoEvento } from '@/types/evento-contratos';
import {
  FileText,
  Plus,
  ChevronDown,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarContratoEventoSheet } from './EditarContratoEventoSheet';

interface ContratosEventoProps {
  evento: Evento;
}

const TIPOS: TipoContratoEvento[] = ['bar', 'ingresso', 'bar_ingresso', 'credenciamento'];

export function ContratosEvento({ evento }: ContratosEventoProps) {
  const { contratos, isLoading, criarContrato, excluirContrato, uploadArquivoAssinado } =
    useEventoContratos(evento.id);
  const [contratoEditando, setContratoEditando] = useState<ContratoEvento | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleGerarContrato = async (tipo: TipoContratoEvento) => {
    const conteudo = gerarContratoFromModelo(tipo, {
      evento: {
        nome: evento.nome,
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim,
        local: evento.local,
        cidade: evento.cidade,
        estado: evento.estado,
      },
      cliente: evento.cliente
        ? {
            nome: evento.cliente.nome,
            documento: evento.cliente.documento,
            email: evento.cliente.email,
            telefone: evento.cliente.telefone,
          }
        : null,
    });

    const contrato = await criarContrato.mutateAsync({
      tipo,
      titulo: TIPO_CONTRATO_LABELS[tipo],
      conteudo,
    });

    setContratoEditando(contrato);
  };

  const handleUploadClick = (contratoId: string) => {
    setUploadingId(contratoId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;

    await uploadArquivoAssinado.mutateAsync({ id: uploadingId, arquivo: file });
    setUploadingId(null);
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {contratos.length === 0
            ? 'Nenhum contrato gerado'
            : `${contratos.length} contrato${contratos.length > 1 ? 's' : ''}`}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={criarContrato.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Gerar Contrato
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TIPOS.map((tipo) => (
              <DropdownMenuItem key={tipo} onClick={() => handleGerarContrato(tipo)}>
                <FileText className="h-4 w-4 mr-2" />
                {TIPO_CONTRATO_LABELS[tipo]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lista de contratos */}
      {contratos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum contrato gerado para este evento</p>
          <p className="text-sm text-muted-foreground mt-1">
            Use o botão "Gerar Contrato" para criar a partir de um modelo
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {contratos.map((contrato) => (
            <Card key={contrato.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <CardTitle className="text-base truncate">{contrato.titulo}</CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      contrato.status === 'finalizado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0'
                        : 'bg-amber-50 text-amber-700 border-amber-200 shrink-0'
                    }
                  >
                    {contrato.status === 'finalizado' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {contrato.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Criado em{' '}
                  {format(new Date(contrato.criadoEm), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                </p>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Arquivo assinado */}
                {contrato.arquivoAssinadoUrl ? (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{contrato.arquivoAssinadoNome}</span>
                    <a
                      href={contrato.arquivoAssinadoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUploadClick(contrato.id)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full p-2 rounded-md hover:bg-muted/50 border border-dashed border-border"
                  >
                    <Paperclip className="h-4 w-4" />
                    Anexar contrato assinado (PDF)
                  </button>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContratoEditando(contrato)}
                    className="flex-1"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => excluirContrato.mutate(contrato.id)}
                    disabled={excluirContrato.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Input oculto para upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Sheet de edição */}
      {contratoEditando && (
        <EditarContratoEventoSheet
          contrato={contratoEditando}
          open={!!contratoEditando}
          onOpenChange={(open) => {
            if (!open) setContratoEditando(null);
          }}
          eventoId={evento.id}
        />
      )}
    </div>
  );
}
