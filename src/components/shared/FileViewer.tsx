import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export function FileViewer({ isOpen, onClose, fileUrl, fileName, fileType }: FileViewerProps) {
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate">{fileName}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Nova aba
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage && (
            <img 
              src={fileUrl} 
              alt={fileName}
              className="w-full h-auto object-contain"
            />
          )}

          {isPDF && (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          )}

          {!isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Preview não disponível para este tipo de arquivo</p>
              <Button onClick={handleDownload} className="mt-4">
                Baixar arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
