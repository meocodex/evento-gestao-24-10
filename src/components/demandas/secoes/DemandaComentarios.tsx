import { useState } from 'react';
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

interface DemandaComentariosProps {
  demanda: Demanda;
}

export function DemandaComentarios({ demanda }: DemandaComentariosProps) {
  const { adicionarComentario } = useDemandas();
  const { user } = useAuth();
  const { usuarios } = useUsuarios();
  const [novoComentario, setNovoComentario] = useState('');

  const handleEnviarComentario = () => {
    if (!novoComentario.trim() || !user) return;

    const usuarioAtual = (usuarios || []).find(u => u.id === user.id);
    adicionarComentario.mutate({
      demandaId: demanda.id,
      conteudo: novoComentario,
      autor: usuarioAtual?.nome || user.email,
      autorId: user.id
    });
    setNovoComentario('');
  };

  const comentariosOrdenados = [...(demanda.comentarios || [])].sort(
    (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Input novo comentário */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Escrever um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleEnviarComentario}
                disabled={!novoComentario.trim() || adicionarComentario.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de comentários */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comentários ({comentariosOrdenados.length})
        </h3>
        
        {comentariosOrdenados.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum comentário ainda
            </CardContent>
          </Card>
        ) : (
          comentariosOrdenados.map((comentario) => (
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
