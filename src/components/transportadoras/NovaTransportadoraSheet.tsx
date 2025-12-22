import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Label } from '@/components/ui/label';
import { useTransportadoras } from '@/hooks/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
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
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[540px] lg:w-[600px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-4">
          <SheetTitle className="text-xl font-display text-navy-800">
            Nova Transportadora
          </SheetTitle>
          <SheetDescription className="text-sm text-navy-500">
            Cadastre uma nova transportadora no sistema
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Fantasia + CNPJ */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7 space-y-1.5">
              <Label htmlFor="nome" className="text-sm text-navy-700">Nome Fantasia *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="h-9 border-navy-200"
              />
            </div>
            <div className="col-span-5 space-y-1.5">
              <Label htmlFor="cnpj" className="text-sm text-navy-700">CNPJ *</Label>
              <MaskedInput
                id="cnpj"
                mask="cnpj"
                required
                value={formData.cnpj}
                onChange={(value) => setFormData({ ...formData, cnpj: value })}
                className="h-9 border-navy-200"
              />
            </div>
          </div>

          {/* Razão Social */}
          <div className="space-y-1.5">
            <Label htmlFor="razaoSocial" className="text-sm text-navy-700">Razão Social *</Label>
            <Input
              id="razaoSocial"
              required
              value={formData.razaoSocial}
              onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
              className="h-9 border-navy-200"
            />
          </div>

          {/* Responsável + Telefone */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7 space-y-1.5">
              <Label htmlFor="responsavel" className="text-sm text-navy-700">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                className="h-9 border-navy-200"
                placeholder="Nome do responsável"
              />
            </div>
            <div className="col-span-5 space-y-1.5">
              <Label htmlFor="telefone" className="text-sm text-navy-700">Telefone *</Label>
              <MaskedInput
                id="telefone"
                mask="telefone"
                required
                value={formData.telefone}
                onChange={(value) => setFormData({ ...formData, telefone: value })}
                className="h-9 border-navy-200"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-navy-700">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-9 border-navy-200"
            />
          </div>

          {/* Endereço */}
          <div className="pt-3 border-t border-navy-100">
            <h4 className="text-sm font-medium text-navy-800 mb-3">Endereço</h4>
            
            {/* CEP + Rua + Número */}
            <div className="grid grid-cols-12 gap-3 mb-3">
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor="cep" className="text-sm text-navy-700">CEP *</Label>
                <div className="relative">
                  <MaskedInput
                    id="cep"
                    mask="cep"
                    required
                    value={formData.endereco.cep}
                    onChange={(value) => setFormData({ ...formData, endereco: { ...formData.endereco, cep: value } })}
                    className={`h-9 ${buscandoCEP ? "border-navy-200 pr-8" : "border-navy-200"}`}
                  />
                  {buscandoCEP && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="col-span-7 space-y-1.5">
                <Label htmlFor="rua" className="text-sm text-navy-700">Rua *</Label>
                <Input
                  id="rua"
                  required
                  value={formData.endereco.rua}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })}
                  className="h-9 border-navy-200"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="numero" className="text-sm text-navy-700">Nº *</Label>
                <Input
                  id="numero"
                  required
                  value={formData.endereco.numero}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                  className="h-9 border-navy-200"
                />
              </div>
            </div>

            {/* Complemento */}
            <div className="space-y-1.5 mb-3">
              <Label htmlFor="complemento" className="text-sm text-navy-700">Complemento</Label>
              <Input
                id="complemento"
                value={formData.endereco.complemento}
                onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, complemento: e.target.value } })}
                className="h-9 border-navy-200"
              />
            </div>

            {/* Bairro + Cidade + UF */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 space-y-1.5">
                <Label htmlFor="bairro" className="text-sm text-navy-700">Bairro *</Label>
                <Input
                  id="bairro"
                  required
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                  className="h-9 border-navy-200"
                />
              </div>
              <div className="col-span-6 space-y-1.5">
                <Label htmlFor="cidade" className="text-sm text-navy-700">Cidade *</Label>
                <Input
                  id="cidade"
                  required
                  value={formData.endereco.cidade}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                  className="h-9 border-navy-200"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="estado" className="text-sm text-navy-700">UF *</Label>
                <Input
                  id="estado"
                  required
                  maxLength={2}
                  value={formData.endereco.estado}
                  onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })}
                  className="h-9 border-navy-200"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-4 mt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">
              Cancelar
            </Button>
            <Button type="submit" className="h-9">
              Criar Transportadora
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
