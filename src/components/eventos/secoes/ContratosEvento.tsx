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

export function ContratosEvento({ evento }: ContratosEventoProps) {
  const { documentos, isLoading, adicionarDocumento, removerDocumento, getSignedUrl } =
    useEventoDocumentos(evento.id);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.error('Informe um nome para o documento');
      return;
    }
    if (!arquivo) {
      toast.error('Selecione um arquivo');
      return;
    }

    setEnviando(true);
    try {
      await adicionarDocumento.mutateAsync({ titulo: titulo.trim(), arquivo });
      setDialogAberto(false);
      setTitulo('');
      setArquivo(null);
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

  const handleRemover = (id: string, storagePath: string) => {
    removerDocumento.mutate({ id, storagePath });
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
                      onClick={() => doc.arquivoUrl && handleRemover(doc.id, doc.arquivoUrl)}
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
        if (!open) { setTitulo(''); setArquivo(null); }
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
              <Label>Arquivo *</Label>
              <div
                className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {arquivo ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="font-medium truncate max-w-[250px]">{arquivo.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Paperclip className="h-6 w-6" />
                    <span className="text-sm">Clique para selecionar</span>
                    <span className="text-xs">PDF, DOC, DOCX, XLS, JPG, PNG</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
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
    </div>
  );
}
