import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft, Landmark, QrCode, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useCadastros } from '@/hooks/cadastros';
import { BANCOS_BRASILEIROS, TIPOS_CHAVE_PIX, TIPOS_CONTA } from '@/lib/constants/bancos';
import type { DadosBancarios } from '@/types/eventos';

export default function AcompanharCadastro() {
  const { protocolo } = useParams<{ protocolo: string }>();
  const navigate = useNavigate();
  const { cadastros } = useCadastros();

  const cadastro = protocolo ? cadastros.find(c => c.protocolo === protocolo) : undefined;

  if (!cadastro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Protocolo não encontrado</CardTitle>
            <CardDescription>
              O protocolo "{protocolo}" não foi encontrado em nossa base de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/cadastro-evento')} className="w-full">
              Fazer novo cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (cadastro.status) {
      case 'aprovado':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'recusado':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'em_analise':
        return <Clock className="h-8 w-8 text-blue-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (cadastro.status) {
      case 'aprovado':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'recusado':
        return <Badge variant="destructive">Recusado</Badge>;
      case 'em_analise':
        return <Badge className="bg-blue-500">Em Análise</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/cadastro-evento')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Acompanhamento de Cadastro</CardTitle>
                <CardDescription>Protocolo: {cadastro.protocolo}</CardDescription>
              </div>
              {getStatusIcon()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Status</Label>
              <div className="mt-2">
                {getStatusBadge()}
              </div>
            </div>

            <div>
              <Label>Nome do Evento</Label>
              <p className="mt-1 font-medium">{cadastro.nome}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Data do Evento</Label>
                <p className="mt-1">
                  {format(new Date(cadastro.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <Label>Local</Label>
                <p className="mt-1">{cadastro.local}</p>
              </div>
            </div>

            <div>
              <Label>Tipo de Evento</Label>
              <p className="mt-1 capitalize">{cadastro.tipoEvento.replace('_', ' ')}</p>
            </div>

            <div>
              <Label>Data do Cadastro</Label>
              <p className="mt-1">
                {format(new Date(cadastro.dataCriacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>

            {cadastro.status === 'aprovado' && cadastro.eventoId && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Seu evento foi aprovado! Nossa equipe entrará em contato em breve através do e-mail{' '}
                  <strong>{cadastro.produtor.email}</strong> ou WhatsApp{' '}
                  <strong>{cadastro.produtor.whatsapp}</strong>.
                </AlertDescription>
              </Alert>
            )}

            {cadastro.status === 'recusado' && cadastro.observacoesInternas && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Motivo da recusa:</strong> {cadastro.observacoesInternas}
                </AlertDescription>
              </Alert>
            )}

            {cadastro.status === 'pendente' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Seu cadastro está em análise. Aguarde o contato de nossa equipe.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Produtor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <p className="mt-1">{cadastro.produtor.nome}</p>
              </div>
              <div>
                <Label>Documento</Label>
                <p className="mt-1">{cadastro.produtor.documento}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>E-mail</Label>
                <p className="mt-1">{cadastro.produtor.email}</p>
              </div>
              <div>
                <Label>WhatsApp</Label>
                <p className="mt-1">{cadastro.produtor.whatsapp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Bancários */}
        {cadastro.produtor.dadosBancarios && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Dados para Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(cadastro.produtor.dadosBancarios as DadosBancarios).tipoPagamento === 'pix' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Chave PIX</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      {TIPOS_CHAVE_PIX.find(t => t.value === (cadastro.produtor.dadosBancarios as DadosBancarios).tipoChavePix)?.label || (cadastro.produtor.dadosBancarios as DadosBancarios).tipoChavePix}
                    </p>
                  </div>
                  <div>
                    <Label>Chave PIX</Label>
                    <p className="mt-1 font-medium">{(cadastro.produtor.dadosBancarios as DadosBancarios).chavePix}</p>
                  </div>
                </div>
              )}

              {(cadastro.produtor.dadosBancarios as DadosBancarios).tipoPagamento === 'conta_bancaria' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Banco</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {BANCOS_BRASILEIROS.find(b => b.codigo === (cadastro.produtor.dadosBancarios as DadosBancarios).banco)?.nome || (cadastro.produtor.dadosBancarios as DadosBancarios).banco}
                    </p>
                  </div>
                  <div>
                    <Label>Agência</Label>
                    <p className="mt-1">{(cadastro.produtor.dadosBancarios as DadosBancarios).agencia}</p>
                  </div>
                  <div>
                    <Label>Conta</Label>
                    <p className="mt-1">{(cadastro.produtor.dadosBancarios as DadosBancarios).conta}</p>
                  </div>
                  <div>
                    <Label>Tipo de Conta</Label>
                    <p className="mt-1">{TIPOS_CONTA.find(t => t.value === (cadastro.produtor.dadosBancarios as DadosBancarios).tipoConta)?.label || (cadastro.produtor.dadosBancarios as DadosBancarios).tipoConta}</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <Label>Nome do Titular</Label>
                  <p className="mt-1 font-medium">{(cadastro.produtor.dadosBancarios as DadosBancarios).nomeTitular}</p>
                </div>
                <div>
                  <Label>CPF/CNPJ do Titular</Label>
                  <p className="mt-1">{(cadastro.produtor.dadosBancarios as DadosBancarios).cpfCnpjTitular}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
