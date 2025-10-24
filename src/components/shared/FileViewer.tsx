import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export function FileViewer({ isOpen, onClose, fileUrl, fileName, fileType }: FileViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToScreen = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="truncate flex-1">{fileName}</DialogTitle>
            
            {/* Controls for images */}
            {isImage && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-32">
                    <Slider
                      value={[zoom]}
                      onValueChange={handleZoomChange}
                      min={25}
                      max={300}
                      step={25}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 300}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRotate}
                  title="Rotacionar"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFitToScreen}
                  title="Ajustar à tela"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Action buttons */}
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

        <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
          {isImage && (
            <div className="flex items-center justify-center min-h-full">
              <img 
                src={fileUrl} 
                alt={fileName}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                className="shadow-lg"
              />
            </div>
          )}

          {isPDF && (
            <div className="h-full">
              <iframe
                src={`${fileUrl}#zoom=page-fit&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0 rounded"
                title={fileName}
              />
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Use os controles do PDF para navegar entre páginas e fazer zoom
              </div>
            </div>
          )}

          {!isImage && !isPDF && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg mb-2">Preview não disponível para este tipo de arquivo</p>
              <p className="text-sm mb-4">{fileType}</p>
              <Button onClick={handleDownload} size="lg">
                <Download className="h-4 w-4 mr-2" />
                Baixar arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}