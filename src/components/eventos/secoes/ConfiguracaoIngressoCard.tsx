import { ConfiguracaoIngresso } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Users, Image, MapPin, CreditCard } from 'lucide-react';

interface ConfiguracaoIngressoCardProps {
  configuracao: ConfiguracaoIngresso;
  onImageClick?: (url: string, nome: string) => void;
}

export function ConfiguracaoIngressoCard({ configuracao, onImageClick }: ConfiguracaoIngressoCardProps) {
  const { setores: setoresOriginal, banners } = configuracao;

  // Filtrar setores e tipos de ingresso vazios (dados antigos podem ter registros incompletos)
  const setores = setoresOriginal
    ?.filter(s => s.nome && s.nome.trim() !== '')
    .map(setor => ({
      ...setor,
      tiposIngresso: setor.tiposIngresso?.filter(t => t.nome && t.nome.trim() !== '') || []
    })) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const hasBanners = banners && (banners.bannerSite || banners.miniaturaSite || banners.mapaSite || banners.ingressoPOS);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Configuração de Ingressos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Setores */}
        {setores && setores.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Setores ({setores.length})
            </h4>
            <div className="grid gap-4">
              {setores.map((setor, setorIdx) => (
                <div 
                  key={setor.id || setorIdx} 
                  className="border rounded-lg p-4 bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-semibold">
                        {setor.nome || `Setor ${setorIdx + 1}`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{setor.capacidade?.toLocaleString('pt-BR') || 0} pessoas</span>
                    </div>
                  </div>

                  {/* Tipos de Ingresso do Setor */}
                  {setor.tiposIngresso && setor.tiposIngresso.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Tipos de Ingresso:</p>
                      <div className="grid gap-2">
                        {setor.tiposIngresso.map((tipo, tipoIdx) => (
                          <div 
                            key={tipo.id || tipoIdx}
                            className="bg-background rounded-md p-3 border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {tipo.nome || `Tipo ${tipoIdx + 1}`}
                              </span>
                            </div>
                            
                            {/* Lotes */}
                            {tipo.lotes && tipo.lotes.length > 0 ? (
                              <div className="space-y-1">
                                {tipo.lotes.map((lote, loteIdx) => (
                                  <div 
                                    key={loteIdx}
                                    className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1"
                                  >
                                    <span className="text-muted-foreground">
                                      Lote {lote.numero || loteIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-primary">
                                        {formatCurrency(lote.preco || 0)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {lote.quantidade?.toLocaleString('pt-BR') || 0} un
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                Nenhum lote configurado
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!setor.tiposIngresso || setor.tiposIngresso.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum tipo de ingresso configurado
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(!setores || setores.length === 0) && (
          <p className="text-sm text-muted-foreground">Nenhum setor configurado</p>
        )}

        {/* Banners */}
        {hasBanners && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Banners e Imagens
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {banners.bannerSite && (
                <BannerPreview
                  url={banners.bannerSite}
                  label="Banner Site"
                  icon={<Image className="h-4 w-4" />}
                  onClick={onImageClick}
                />
              )}
              {banners.miniaturaSite && (
                <BannerPreview
                  url={banners.miniaturaSite}
                  label="Miniatura"
                  icon={<Image className="h-4 w-4" />}
                  onClick={onImageClick}
                />
              )}
              {banners.mapaSite && (
                <BannerPreview
                  url={banners.mapaSite}
                  label="Mapa do Site"
                  icon={<MapPin className="h-4 w-4" />}
                  onClick={onImageClick}
                />
              )}
              {banners.ingressoPOS && (
                <BannerPreview
                  url={banners.ingressoPOS}
                  label="Ingresso POS"
                  icon={<CreditCard className="h-4 w-4" />}
                  onClick={onImageClick}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BannerPreviewProps {
  url: string;
  label: string;
  icon: React.ReactNode;
  onClick?: (url: string, nome: string) => void;
}

function BannerPreview({ url, label, icon, onClick }: BannerPreviewProps) {
  return (
    <button
      onClick={() => onClick?.(url, label)}
      className="group flex flex-col items-center gap-2 p-2 rounded-lg border-2 border-transparent hover:border-primary transition-colors bg-muted/30"
    >
      <div className="aspect-video w-full rounded overflow-hidden bg-muted">
        <img 
          src={url} 
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );
}
