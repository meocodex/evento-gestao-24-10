import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCategorias } from '@/hooks/categorias';
import { useEquipe } from '@/hooks/equipe';
import { useConflitosEquipe } from '@/hooks/equipe';
import { MembroEquipe } from '@/types/eventos';
import { AlertTriangle, User, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdicionarMembroEquipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (membro: Omit<MembroEquipe, 'id'>) => Promise<void>;
  eventoId?: string;
}

export function AdicionarMembroEquipeDialog({ 
  open, 
  onOpenChange, 
  onAdicionar,
  eventoId 
}: AdicionarMembroEquipeDialogProps) {
  const { toast } = useToast();
  const { funcoesEquipe } = useCategorias();
  const { operacionais } = useEquipe();
  const { verificarConflitos } = useConflitosEquipe();

  // Memoizar operacionais ativos para evitar recalcular sempre
  const operacionaisAtivos = useMemo(() => 
    operacionais.filter(op => op.status === 'ativo'),
    [operacionais]
  );

  const [modo, setModo] = useState<'selecionar' | 'novo'>('selecionar');
  const [operacionalId, setOperacionalId] = useState('');
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [conflitos, setConflitos] = useState<any[]>([]);
  const [verificandoConflitos, setVerificandoConflitos] = useState(false);

  // Preencher dados ao selecionar operacional
  useEffect(() => {
    if (operacionalId && modo === 'selecionar') {
      const operacional = operacionaisAtivos.find(op => op.id === operacionalId);
      if (operacional) {
        setNome(operacional.nome);
        setFuncao(operacional.funcao_principal);
        setTelefone(operacional.telefone);
        setWhatsapp(operacional.whatsapp || '');
      }
    }
  }, [operacionalId, modo, operacionaisAtivos]);

  // Verificar conflitos quando mudar período (com debounce implícito via timeout)
  useEffect(() => {
    // Não verificar se faltam dados essenciais
    if (!dataInicio || !dataFim) {
      setConflitos([]);
      return;
    }

    // Não verificar se não tem identificação do membro
    if (modo === 'selecionar' && !operacionalId) return;
    if (modo === 'novo' && (!nome || !funcao)) return;

    setVerificandoConflitos(true);
    
    // Timeout para evitar chamadas excessivas durante digitação
    const timer = setTimeout(async () => {
      try {
        const resultado = await verificarConflitos({
          operacionalId: modo === 'selecionar' ? operacionalId : undefined,
          nome: modo === 'novo' ? nome : undefined,
          funcao: modo === 'novo' ? funcao : undefined,
          dataInicio,
          dataFim,
          eventoAtualId: eventoId
        });
        setConflitos(resultado);
      } catch (error) {
        console.error('Erro ao verificar conflitos:', error);
        setConflitos([]);
      } finally {
        setVerificandoConflitos(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timer);
      setVerificandoConflitos(false);
    };
  }, [dataInicio, dataFim, operacionalId, nome, funcao, modo, eventoId]);

  const resetForm = () => {
    setModo('selecionar');
    setOperacionalId('');
    setNome('');
    setFuncao('');
    setTelefone('');
    setWhatsapp('');
    setDataInicio('');
    setDataFim('');
    setObservacoes('');
    setConflitos([]);
  };

  const handleSubmit = async () => {
    if (!nome || !funcao || !telefone) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, função e telefone.',
        variant: 'destructive'
      });
      return;
    }

    if (conflitos.length > 0) {
      toast({
        title: 'Conflito de datas',
        description: 'Este membro já está alocado em outro evento no período selecionado.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await onAdicionar({
        nome,
        funcao,
        telefone,
        whatsapp: whatsapp || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        observacoes: observacoes || undefined,
        operacionalId: modo === 'selecionar' ? operacionalId : undefined
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seletor de Modo */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={modo === 'selecionar' ? 'default' : 'outline'}
              onClick={() => setModo('selecionar')}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Selecionar Cadastrado
            </Button>
            <Button
              type="button"
              variant={modo === 'novo' ? 'default' : 'outline'}
              onClick={() => setModo('novo')}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Novo
            </Button>
          </div>

          {/* Modo: Selecionar Operacional Cadastrado */}
          {modo === 'selecionar' && (
            <div>
              <Label htmlFor="operacional">Operacional Cadastrado *</Label>
              <Select value={operacionalId} onValueChange={setOperacionalId}>
                <SelectTrigger id="operacional">
                  <SelectValue placeholder="Selecione um operacional" />
                </SelectTrigger>
                <SelectContent>
                  {operacionaisAtivos.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.nome} - {op.funcao_principal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {operacionalId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dados serão preenchidos automaticamente
                </p>
              )}
            </div>
          )}

          {/* Modo: Novo Membro */}
          {modo === 'novo' && (
            <>
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="funcao">Função *</Label>
                <Select value={funcao} onValueChange={setFuncao}>
                  <SelectTrigger id="funcao">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcoesEquipe.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos comuns */}
          {(modo === 'selecionar' ? operacionalId : nome) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>

              {/* Alertas de Conflito */}
              {verificandoConflitos && (
                <Alert>
                  <AlertDescription>
                    Verificando disponibilidade...
                  </AlertDescription>
                </Alert>
              )}

              {!verificandoConflitos && conflitos.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Conflito de datas detectado!</p>
                    <ul className="space-y-1 text-sm">
                      {conflitos.map((conflito, idx) => (
                        <li key={idx}>
                          • Evento: <strong>{conflito.eventoNome}</strong>
                          <br />
                          Período: {format(new Date(conflito.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} 
                          {' até '}
                          {format(new Date(conflito.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {!verificandoConflitos && conflitos.length === 0 && dataInicio && dataFim && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <AlertDescription>
                    ✓ Nenhum conflito detectado para este período
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre a alocação..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              verificandoConflitos ||
              conflitos.length > 0 ||
              (modo === 'selecionar' && !operacionalId) ||
              (modo === 'novo' && (!nome || !funcao || !telefone))
            }
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
