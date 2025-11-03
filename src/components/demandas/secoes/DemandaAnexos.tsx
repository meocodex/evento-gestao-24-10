import { useState } from 'react';
import { Demanda } from '@/types/demandas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileViewer } from '@/components/shared/FileViewer';
import { useDemandasAnexos } from '@/hooks/demandas';
import { Paperclip, Download, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface DemandaAnexosProps {
  demanda: Demanda;
}

export function DemandaAnexos({ demanda }: DemandaAnexosProps) {
  const { anexos, isLoading, removerAnexo } = useDemandasAnexos(demanda.id);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; nome: string; tipo: string } | null>(null);

  const handleVisualizarArquivo = (anexo: any) => {
    setSelectedFile({ 
      url: anexo.url, 
      nome: anexo.nome, 
      tipo: anexo.tipo || 'application/octet-stream' 
    });
    setFileViewerOpen(true);
  };

  const handleRemoverAnexo = (anexo: any) => {
    if (confirm('Deseja realmente remover este anexo?')) {
      removerAnexo.mutate({
        demandaId: demanda.id,
        anexoId: anexo.id,
        url: anexo.url
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando anexos...
      </div>
    );
  }

  if (!anexos || anexos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>Nenhum anexo nesta demanda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Anexos ({anexos.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anexos.map((anexo) => (
            <Card key={anexo.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{anexo.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado por {anexo.uploadPor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(anexo.uploadEm), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleVisualizarArquivo(anexo)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      asChild
                    >
                      <a href={anexo.url} download={anexo.nome}>
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleRemoverAnexo(anexo)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedFile && (
        <FileViewer
          fileUrl={selectedFile.url}
          fileName={selectedFile.nome}
          fileType={selectedFile.tipo}
          isOpen={fileViewerOpen}
          onClose={() => setFileViewerOpen(false)}
        />
      )}
    </>
  );
}
