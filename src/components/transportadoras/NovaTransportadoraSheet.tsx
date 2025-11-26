import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransportadoras } from '@/hooks/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import { formatarCEP, formatarCNPJ, formatarTelefone } from '@/lib/formatters';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';
import { useToast } from '@/hooks/use-toast';

interface NovaTransportadoraSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaTransportadoraSheet({ open, onOpenChange }: NovaTransportadoraSheetProps) {
  const { criarTransportadora } = useTransportadoras();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    razaoSocial: '',
    telefone: '',
    email: '',
    responsavel: '',
    status: 'ativa' as 'ativa' | 'inativa',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    rotasAtendidas: [],
  });

  // Busca automática de CEP com debounce
  useEffect(() => {
    const cepLimpo = formData.endereco.cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setBuscandoCEP(true);
      try {
        const endereco = await buscarEnderecoPorCEP(formData.endereco.cep);
        
        if (endereco) {
          setFormData({
            ...formData,
            endereco: {
              ...formData.endereco,
              rua: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.localidade,
              estado: endereco.uf,
            }
          });
          
          toast({
            title: 'CEP encontrado!',
            description: 'Endereço preenchido automaticamente.',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          title: 'CEP não encontrado',
          description: 'Preencha o endereço manualmente.',
          variant: 'destructive',
        });
      } finally {
        setBuscandoCEP(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.endereco.cep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await criarTransportadora.mutateAsync(formData);
    onOpenChange(false);
    setFormData({
      nome: '',
      cnpj: '',
      razaoSocial: '',
      telefone: '',
      email: '',
      responsavel: '',
      status: 'ativa' as 'ativa' | 'inativa',
      endereco: {
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
      rotasAtendidas: [],
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">
            Nova Transportadora
          </SheetTitle>
          <SheetDescription className="text-navy-500">
            Cadastre uma nova transportadora no sistema
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-navy-700">Nome Fantasia *</Label>
                <Input
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="cnpj" className="text-navy-700">CNPJ *</Label>
                <Input
                  id="cnpj"
                  required
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatarCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="razaoSocial" className="text-navy-700">Razão Social *</Label>
              <Input
                id="razaoSocial"
                required
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsavel" className="text-navy-700">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                  placeholder="Nome do responsável (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="telefone" className="text-navy-700">Telefone *</Label>
                <Input
                  id="telefone"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-navy-700">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
              />
            </div>

            <div className="pt-4 border-t border-navy-100">
              <h3 className="text-lg font-semibold text-navy-800 mb-4">Endereço</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep" className="text-navy-700">CEP *</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        required
                        value={formData.endereco.cep}
                        onChange={(e) => {
                          const formatted = formatarCEP(e.target.value);
                          setFormData({ ...formData, endereco: { ...formData.endereco, cep: formatted } });
                        }}
                        placeholder="00000-000"
                        maxLength={9}
                        className={buscandoCEP ? "border-navy-200 pr-10" : "border-navy-200"}
                      />
                      {buscandoCEP && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite o CEP para buscar automaticamente
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="rua" className="text-navy-700">Rua *</Label>
                    <Input
                      id="rua"
                      required
                      value={formData.endereco.rua}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })}
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero" className="text-navy-700">Número *</Label>
                    <Input
                      id="numero"
                      required
                      value={formData.endereco.numero}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complemento" className="text-navy-700">Complemento (Opcional)</Label>
                    <Input
                      id="complemento"
                      value={formData.endereco.complemento}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, complemento: e.target.value } })}
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bairro" className="text-navy-700">Bairro *</Label>
                    <Input
                      id="bairro"
                      required
                      value={formData.endereco.bairro}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade" className="text-navy-700">Cidade *</Label>
                    <Input
                      id="cidade"
                      required
                      value={formData.endereco.cidade}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado" className="text-navy-700">Estado *</Label>
                    <Input
                      id="estado"
                      required
                      value={formData.endereco.estado}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })}
                      className="border-navy-200 focus:border-navy-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-6 mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Transportadora
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
