import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfiguracaoBar } from '@/types/eventos';
import { Store, MapPin, Image, Monitor } from 'lucide-react';

interface ConfiguracaoBarCardProps {
  configuracao: ConfiguracaoBar;
  onImageClick?: (url: string, nome: string) => void;
}

export function ConfiguracaoBarCard({ configuracao, onImageClick }: ConfiguracaoBarCardProps) {
  const { estabelecimentos, mapaLocal, mapaLocalArquivo, logoEvento } = configuracao;

  const handlePreviewClick = (url: string | undefined, nome: string) => {
    if (url && onImageClick) {
      onImageClick(url, nome);
    }
  };

  const ImagePreview = ({ url, label, icon: Icon }: { url?: string; label: string; icon: React.ElementType }) => {
    if (!url) return null;
    
    return (
      <button
        onClick={() => handlePreviewClick(url, label)}
        className="group relative flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-background/50 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <div className="w-20 h-20 rounded overflow-hidden bg-muted flex items-center justify-center">
          <img 
            src={url} 
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
            }}
          />
          <Icon className="fallback-icon hidden h-8 w-8 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      </button>
    );
  };

  const hasEstabelecimentos = estabelecimentos && estabelecimentos.length > 0;
  const hasMapa = mapaLocal || mapaLocalArquivo;
  const hasLogo = logoEvento;
  const hasAnyMedia = hasMapa || hasLogo;

  if (!hasEstabelecimentos && !hasAnyMedia) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Configuração de Bar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estabelecimentos */}
        {hasEstabelecimentos && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Estabelecimentos</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {estabelecimentos.map((estabelecimento) => (
                <div
                  key={estabelecimento.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{estabelecimento.nome || 'Sem nome'}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Monitor className="h-3 w-3" />
                        <span>{estabelecimento.quantidadeMaquinas || 0} máquina{(estabelecimento.quantidadeMaquinas || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  {estabelecimento.cardapioUrl && (
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handlePreviewClick(estabelecimento.cardapioUrl, `Cardápio - ${estabelecimento.nome}`)}
                    >
                      Cardápio
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mídias (Mapa e Logo) */}
        {hasAnyMedia && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Mídias do Evento</h4>
            <div className="flex flex-wrap gap-4">
              <ImagePreview 
                url={mapaLocalArquivo || mapaLocal} 
                label="Mapa do Local" 
                icon={MapPin} 
              />
              <ImagePreview 
                url={logoEvento} 
                label="Logo do Evento" 
                icon={Image} 
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
