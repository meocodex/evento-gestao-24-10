import { useState, useEffect } from 'react';
import { Demanda } from '@/types/demandas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDemandas } from '@/hooks/demandas';
import { useAuth } from '@/hooks/useAuth';
import { useUsuarios } from '@/hooks/useUsuarios';
import { format } from 'date-fns';
import { Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DemandaComentariosProps {
  demanda: Demanda;
}

export function DemandaComentarios({ demanda }: DemandaComentariosProps) {
  const { adicionarMensagem } = useDemandas();
  const { user } = useAuth();
  const { usuarios } = useUsuarios();
  const [novaMensagem, setNovaMensagem] = useState('');
  const queryClient = useQueryClient();

  // Real-time listener específico para esta demanda
  useEffect(() => {
    const channel = supabase
      .channel(`demanda-${demanda.id}-comentarios`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'demandas_comentarios',
          filter: `demanda_id=eq.${demanda.id}`
        },
        (payload) => {
          queryClient.setQueriesData({ queryKey: ['demandas'] }, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              demandas: old.demandas?.map((d: any) => 
                d.id === demanda.id 
                  ? {
                      ...d,
                      comentarios: [
                        ...(d.comentarios || []),
                        {
                          id: payload.new.id,
                          autor: payload.new.autor,
                          autorId: payload.new.autor_id,
                          conteudo: payload.new.conteudo,
                          dataHora: payload.new.created_at,
                          tipo: payload.new.tipo
                        }
                      ]
                    }
                  : d
              )
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [demanda.id, queryClient]);

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim() || !user) return;

    const usuarioAtual = (usuarios || []).find(u => u.id === user.id);
    adicionarMensagem.mutate({
      demandaId: demanda.id,
      conteudo: novaMensagem,
      autor: usuarioAtual?.nome || user.email,
      autorId: user.id
    });
    setNovaMensagem('');
  };

  const mensagensOrdenadas = [...(demanda.comentarios || [])].sort(
    (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Input novo comentário */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Escrever uma mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleEnviarMensagem}
                disabled={!novaMensagem.trim() || adicionarMensagem.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensagens */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Conversa ({mensagensOrdenadas.length})
        </h3>
        
        {mensagensOrdenadas.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma mensagem ainda
            </CardContent>
          </Card>
        ) : (
          mensagensOrdenadas.map((comentario) => (
            <Card key={comentario.id}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comentario.autor.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comentario.autor}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comentario.dataHora), 'dd/MM/yyyy HH:mm')}
                      </span>
                      {comentario.tipo === 'sistema' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Sistema
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{comentario.conteudo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
