import { useState, useRef } from 'react';
import { Evento } from '@/types/eventos';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useEventoDocumentos } from '@/hooks/useEventoContratos';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Paperclip,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ContratosEventoProps {
  evento: Evento;
}

function getFileIcon(nome: string | null) {
  if (!nome) return <FileText className="h-5 w-5 text-muted-foreground shrink-0" />;
  const ext = nome.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
    return <FileImage className="h-5 w-5 text-primary shrink-0" />;
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return <FileSpreadsheet className="h-5 w-5 text-accent-foreground shrink-0" />;
  return <FileText className="h-5 w-5 text-muted-foreground shrink-0" />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContratosEvento({ evento }: ContratosEventoProps) {
  const { documentos, isLoading, adicionarDocumento, removerDocumento, getSignedUrl } =
    useEventoDocumentos(evento.id);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para confirmação de exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [docParaRemover, setDocParaRemover] = useState<{ id: string; storagePath: string } | null>(null);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error('Informe um nome para o documento');
      return;
    }
    if (arquivos.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setEnviando(true);
    try {
      for (let i = 0; i < arquivos.length; i++) {
        const tituloFinal = arquivos.length > 1 ? `${titulo.trim()} (${i + 1})` : titulo.trim();
        await adicionarDocumento.mutateAsync({ titulo: tituloFinal, arquivo: arquivos[i] });
      }
      setDialogAberto(false);
      setTitulo('');
      setArquivos([]);
    } finally {
      setEnviando(false);
    }
  };

  const handleDownload = async (storagePath: string, nomeArquivo: string | null, docId: string) => {
    setBaixandoId(docId);
    try {
      const url = await getSignedUrl(storagePath);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao baixar arquivo');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nomeArquivo ?? 'documento';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Erro ao baixar o arquivo');
    } finally {
      setBaixandoId(null);
    }
  };

  const handleRemoverClick = (id: string, storagePath: string) => {
    setDocParaRemover({ id, storagePath });
    setConfirmOpen(true);
  };

  const handleConfirmRemover = () => {
    if (docParaRemover) {
      removerDocumento.mutate(docParaRemover);
      setDocParaRemover(null);
    }
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
          {documentos.length === 0
            ? 'Nenhum documento adicionado'
            : `${documentos.length} documento${documentos.length > 1 ? 's' : ''}`}
        </p>
        <Button size="sm" onClick={() => setDialogAberto(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Arquivo
        </Button>
      </div>

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
          <Paperclip className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum documento adicionado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione propostas, contratos assinados, riders técnicos e outros arquivos do evento
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {documentos.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.arquivoNome)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.arquivoNome && (
                        <span className="mr-2">{doc.arquivoNome}</span>
                      )}
                      {doc.arquivoTamanho && (
                        <span className="mr-2">• {formatFileSize(doc.arquivoTamanho)}</span>
                      )}
                      {format(new Date(doc.criadoEm), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        doc.arquivoUrl &&
                        handleDownload(doc.arquivoUrl, doc.arquivoNome, doc.id)
                      }
                      disabled={!doc.arquivoUrl || baixandoId === doc.id}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {baixandoId === doc.id ? 'Baixando...' : 'Baixar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => doc.arquivoUrl && handleRemoverClick(doc.id, doc.arquivoUrl)}
                      disabled={removerDocumento.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de adição */}
      <Dialog open={dialogAberto} onOpenChange={(open) => {
        if (!open) { setTitulo(''); setArquivos([]); }
        setDialogAberto(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Nome do documento *</Label>
              <Input
                id="titulo"
                placeholder="ex: Proposta Comercial, Contrato Assinado..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <div className="space-y-2">
              <Label>Arquivo(s) *</Label>
              <div
                className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {arquivos.length > 0 ? (
                  <div className="flex flex-col items-center gap-1 text-sm">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {arquivos.length === 1
                        ? arquivos[0].name
                        : `${arquivos.length} arquivos selecionados`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(arquivos.reduce((acc, f) => acc + f.size, 0))}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Paperclip className="h-6 w-6" />
                    <span className="text-sm">Clique para selecionar</span>
                    <span className="text-xs">PDF, DOC, DOCX, XLS, JPG, PNG (múltiplos permitidos)</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => setArquivos(e.target.files ? Array.from(e.target.files) : [])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir documento"
        description="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmRemover}
        variant="danger"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
