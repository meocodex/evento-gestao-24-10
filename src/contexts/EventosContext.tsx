import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Evento, EventoFormData, MaterialChecklist, MaterialAntecipado, MaterialComTecnicos, Receita, Despesa, MembroEquipe, TimelineItem, StatusEvento } from '@/types/eventos';
import { mockEventos as initialMockEventos } from '@/lib/mock-data/eventos';
import { materiaisEstoque } from '@/lib/mock-data/estoque';
import { useToast } from '@/hooks/use-toast';

interface EventosContextType {
  eventos: Evento[];
  criarEvento: (data: EventoFormData) => Promise<Evento>;
  editarEvento: (id: string, data: Partial<Evento>) => Promise<void>;
  deletarEvento: (id: string) => Promise<void>;
  alterarStatus: (id: string, novoStatus: StatusEvento, observacao?: string) => Promise<void>;
  adicionarMaterialChecklist: (eventoId: string, material: Omit<MaterialChecklist, 'id' | 'alocado'>) => Promise<void>;
  removerMaterialChecklist: (eventoId: string, materialId: string) => Promise<void>;
  alocarMaterial: (eventoId: string, tipo: 'antecipado' | 'comTecnicos', material: Omit<MaterialAntecipado | MaterialComTecnicos, 'id'>) => Promise<void>;
  removerMaterialAlocado: (eventoId: string, tipo: 'antecipado' | 'comTecnicos', materialId: string) => Promise<void>;
  adicionarReceita: (eventoId: string, receita: Omit<Receita, 'id'>) => Promise<void>;
  removerReceita: (eventoId: string, receitaId: string) => Promise<void>;
  adicionarDespesa: (eventoId: string, despesa: Omit<Despesa, 'id'>) => Promise<void>;
  removerDespesa: (eventoId: string, despesaId: string) => Promise<void>;
  adicionarMembroEquipe: (eventoId: string, membro: Omit<MembroEquipe, 'id'>) => Promise<void>;
  removerMembroEquipe: (eventoId: string, membroId: string) => Promise<void>;
  adicionarObservacaoOperacional: (eventoId: string, observacao: string) => Promise<void>;
  uploadArquivo: (eventoId: string, tipo: 'plantaBaixa' | 'documentos' | 'fotosEvento', arquivo: File) => Promise<string>;
  vincularReembolsoADespesa: (eventoId: string, demandaId: string, descricao: string, valor: number, membroNome: string) => Promise<void>;
}

const EventosContext = createContext<EventosContextType | undefined>(undefined);

export function EventosProvider({ children }: { children: ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>(initialMockEventos);
  const { toast } = useToast();

  const adicionarTimeline = (eventoId: string, tipo: TimelineItem['tipo'], descricao: string) => {
    setEventos(prev => prev.map(evento => {
      if (evento.id === eventoId) {
        const novoItem: TimelineItem = {
          id: `timeline-${Date.now()}`,
          data: new Date().toISOString(),
          tipo,
          usuario: 'Usuário Atual',
          descricao
        };
        return {
          ...evento,
          timeline: [...evento.timeline, novoItem],
          atualizadoEm: new Date().toISOString()
        };
      }
      return evento;
    }));
  };

  const criarEvento = async (data: EventoFormData): Promise<Evento> => {
    return new Promise((resolve) => {
      const cliente = require('@/lib/mock-data/clientes').mockClientes.find((c: any) => c.id === data.clienteId);
      const comercial = require('@/lib/mock-data/comerciais').mockComerciais.find((c: any) => c.id === data.comercialId);

      if (!cliente || !comercial) {
        toast({
          title: 'Erro',
          description: 'Cliente ou comercial não encontrado',
          variant: 'destructive'
        });
        return;
      }

      const novoEvento: Evento = {
        id: `evento-${Date.now()}`,
        nome: data.nome,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        local: data.local,
        cidade: data.cidade,
        estado: data.estado,
        endereco: data.endereco,
        cliente,
        comercial,
        status: 'orcamento_enviado',
        tags: data.tags,
        descricao: data.descricao,
        observacoes: data.observacoes,
        contatosAdicionais: data.contatosAdicionais,
        redesSociais: data.redesSociais,
        checklist: [],
        materiaisAlocados: {
          antecipado: [],
          comTecnicos: []
        },
        financeiro: {
          receitas: [],
          despesas: [],
          cobrancas: []
        },
        timeline: [{
          id: 'timeline-1',
          data: new Date().toISOString(),
          tipo: 'criacao',
          usuario: 'Usuário Atual',
          descricao: 'Evento criado'
        }],
        equipe: [],
        observacoesOperacionais: [],
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };

      setEventos(prev => [...prev, novoEvento]);
      
      toast({
        title: 'Evento criado!',
        description: `${novoEvento.nome} foi criado com sucesso.`
      });

      resolve(novoEvento);
    });
  };

  const editarEvento = async (id: string, data: Partial<Evento>): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === id) {
          return {
            ...evento,
            ...data,
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(id, 'edicao', 'Dados do evento atualizados');

      toast({
        title: 'Evento atualizado!',
        description: 'As alterações foram salvas com sucesso.'
      });

      resolve();
    });
  };

  const deletarEvento = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const evento = eventos.find(e => e.id === id);
      setEventos(prev => prev.filter(e => e.id !== id));

      toast({
        title: 'Evento deletado!',
        description: `${evento?.nome} foi removido com sucesso.`
      });

      resolve();
    });
  };

  const alterarStatus = async (id: string, novoStatus: StatusEvento, observacao?: string): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === id) {
          return {
            ...evento,
            status: novoStatus,
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      const descricaoTimeline = observacao 
        ? `Status alterado para ${novoStatus}: ${observacao}`
        : `Status alterado para ${novoStatus}`;

      adicionarTimeline(id, 'edicao', descricaoTimeline);

      toast({
        title: 'Status atualizado!',
        description: `O evento agora está como "${novoStatus}".`
      });

      resolve();
    });
  };

  const adicionarMaterialChecklist = async (eventoId: string, material: Omit<MaterialChecklist, 'id' | 'alocado'>): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const novoMaterial: MaterialChecklist = {
            ...material,
            id: `checklist-${Date.now()}`,
            itemId: material.itemId || `item-${Date.now()}`,
            alocado: 0
          };
          return {
            ...evento,
            checklist: [...evento.checklist, novoMaterial],
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', `Material "${material.nome}" adicionado ao checklist`);
      
      toast({
        title: 'Material adicionado!',
        description: `${material.nome} foi adicionado ao checklist.`
      });

      resolve();
    });
  };

  const removerMaterialChecklist = async (eventoId: string, materialId: string): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const material = evento.checklist.find(m => m.id === materialId);
          return {
            ...evento,
            checklist: evento.checklist.filter(m => m.id !== materialId),
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', 'Material removido do checklist');
      
      toast({
        title: 'Material removido!',
        description: 'O material foi removido do checklist.'
      });

      resolve();
    });
  };

  const alocarMaterial = async (eventoId: string, tipo: 'antecipado' | 'comTecnicos', material: any): Promise<void> => {
    return new Promise((resolve) => {
      const evento = eventos.find(e => e.id === eventoId);
      if (!evento) {
        toast({
          title: 'Erro',
          description: 'Evento não encontrado.',
          variant: 'destructive'
        });
        return;
      }

      // Verificar se o serial existe no estoque e está disponível
      const materialEstoque = materiaisEstoque.find(m => m.id === material.itemId);
      const serialEstoque = materialEstoque?.seriais.find(s => s.numero === material.serial);
      
      if (serialEstoque?.status !== 'disponivel') {
        toast({
          title: 'Erro de Alocação',
          description: 'Este serial não está disponível.',
          variant: 'destructive'
        });
        return;
      }

      // Marcar serial como indisponível no estoque (simulação)
      serialEstoque.status = 'em-uso';
      serialEstoque.eventoId = eventoId;
      serialEstoque.eventoNome = evento.nome;

      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const novoMaterial = {
            ...material,
            id: `alocado-${Date.now()}`,
            status: 'reservado' as const
          };

          // Atualizar quantidade alocada no checklist
          const checklistAtualizado = evento.checklist.map(item => {
            if (item.itemId === material.itemId) {
              return {
                ...item,
                alocado: item.alocado + 1
              };
            }
            return item;
          });

          if (tipo === 'antecipado') {
            return {
              ...evento,
              checklist: checklistAtualizado,
              materiaisAlocados: {
                ...evento.materiaisAlocados,
                antecipado: [...evento.materiaisAlocados.antecipado, novoMaterial]
              },
              atualizadoEm: new Date().toISOString()
            };
          } else {
            return {
              ...evento,
              checklist: checklistAtualizado,
              materiaisAlocados: {
                ...evento.materiaisAlocados,
                comTecnicos: [...evento.materiaisAlocados.comTecnicos, novoMaterial]
              },
              atualizadoEm: new Date().toISOString()
            };
          }
        }
        return evento;
      }));

      const tipoTexto = tipo === 'antecipado' ? 'envio antecipado' : 'com técnicos';
      adicionarTimeline(eventoId, 'alocacao', `Material ${material.nome} (Serial: ${material.serial}) alocado para ${tipoTexto}`);
      
      toast({
        title: 'Material alocado!',
        description: `Serial ${material.serial} alocado com sucesso.`
      });

      resolve();
    });
  };

  const removerMaterialAlocado = async (eventoId: string, tipo: 'antecipado' | 'comTecnicos', materialId: string): Promise<void> => {
    return new Promise((resolve) => {
      // Primeiro, encontrar o material para liberar o serial
      const evento = eventos.find(e => e.id === eventoId);
      if (evento) {
        const listaMateriais = tipo === 'antecipado' 
          ? evento.materiaisAlocados.antecipado 
          : evento.materiaisAlocados.comTecnicos;
        
        const materialRemovido = listaMateriais.find(m => m.id === materialId);
        
        // Liberar serial no estoque
        if (materialRemovido) {
          const materialEstoque = materiaisEstoque.find(m => m.id === materialRemovido.itemId);
          const serialEstoque = materialEstoque?.seriais.find(s => s.numero === materialRemovido.serial);
          
          if (serialEstoque) {
            serialEstoque.status = 'disponivel';
            serialEstoque.eventoId = undefined;
            serialEstoque.eventoNome = undefined;
          }
        }
      }

      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const listaMateriais = tipo === 'antecipado' 
            ? evento.materiaisAlocados.antecipado 
            : evento.materiaisAlocados.comTecnicos;
          
          const materialRemovido = listaMateriais.find(m => m.id === materialId);

          // Atualizar quantidade alocada no checklist
          const checklistAtualizado = evento.checklist.map(item => {
            if (materialRemovido && item.itemId === materialRemovido.itemId) {
              return {
                ...item,
                alocado: Math.max(0, item.alocado - 1)
              };
            }
            return item;
          });

          if (tipo === 'antecipado') {
            return {
              ...evento,
              checklist: checklistAtualizado,
              materiaisAlocados: {
                ...evento.materiaisAlocados,
                antecipado: evento.materiaisAlocados.antecipado.filter(m => m.id !== materialId)
              },
              atualizadoEm: new Date().toISOString()
            };
          } else {
            return {
              ...evento,
              checklist: checklistAtualizado,
              materiaisAlocados: {
                ...evento.materiaisAlocados,
                comTecnicos: evento.materiaisAlocados.comTecnicos.filter(m => m.id !== materialId)
              },
              atualizadoEm: new Date().toISOString()
            };
          }
        }
        return evento;
      }));

      toast({
        title: 'Material removido!',
        description: 'O material foi removido e o serial está disponível novamente.'
      });

      resolve();
    });
  };

  const adicionarReceita = async (eventoId: string, receita: Omit<Receita, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const novaReceita: Receita = {
            ...receita,
            id: `receita-${Date.now()}`
          };
          return {
            ...evento,
            financeiro: {
              ...evento.financeiro,
              receitas: [...evento.financeiro.receitas, novaReceita]
            },
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', `Receita "${receita.descricao}" adicionada`);
      
      toast({
        title: 'Receita adicionada!',
        description: `${receita.descricao} foi adicionada ao financeiro.`
      });

      resolve();
    });
  };

  const removerReceita = async (eventoId: string, receitaId: string): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          return {
            ...evento,
            financeiro: {
              ...evento.financeiro,
              receitas: evento.financeiro.receitas.filter(r => r.id !== receitaId)
            },
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      toast({
        title: 'Receita removida!',
        description: 'A receita foi removida do financeiro.'
      });

      resolve();
    });
  };

  const adicionarDespesa = async (eventoId: string, despesa: Omit<Despesa, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const novaDespesa: Despesa = {
            ...despesa,
            id: `despesa-${Date.now()}`
          };
          return {
            ...evento,
            financeiro: {
              ...evento.financeiro,
              despesas: [...evento.financeiro.despesas, novaDespesa]
            },
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', `Despesa "${despesa.descricao}" adicionada`);
      
      toast({
        title: 'Despesa adicionada!',
        description: `${despesa.descricao} foi adicionada ao financeiro.`
      });

      resolve();
    });
  };

  const removerDespesa = async (eventoId: string, despesaId: string): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          return {
            ...evento,
            financeiro: {
              ...evento.financeiro,
              despesas: evento.financeiro.despesas.filter(d => d.id !== despesaId)
            },
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      toast({
        title: 'Despesa removida!',
        description: 'A despesa foi removida do financeiro.'
      });

      resolve();
    });
  };

  const adicionarMembroEquipe = async (eventoId: string, membro: Omit<MembroEquipe, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          const novoMembro: MembroEquipe = {
            ...membro,
            id: `membro-${Date.now()}`
          };
          return {
            ...evento,
            equipe: [...evento.equipe, novoMembro],
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', `${membro.nome} adicionado à equipe`);
      
      toast({
        title: 'Membro adicionado!',
        description: `${membro.nome} foi adicionado à equipe.`
      });

      resolve();
    });
  };

  const removerMembroEquipe = async (eventoId: string, membroId: string): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          return {
            ...evento,
            equipe: evento.equipe.filter(m => m.id !== membroId),
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      toast({
        title: 'Membro removido!',
        description: 'O membro foi removido da equipe.'
      });

      resolve();
    });
  };

  const adicionarObservacaoOperacional = async (eventoId: string, observacao: string): Promise<void> => {
    return new Promise((resolve) => {
      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          return {
            ...evento,
            observacoesOperacionais: [...evento.observacoesOperacionais, observacao],
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', 'Observação operacional adicionada');
      
      toast({
        title: 'Observação adicionada!',
        description: 'A observação foi registrada.'
      });

      resolve();
    });
  };

  const uploadArquivo = async (eventoId: string, tipo: 'plantaBaixa' | 'documentos' | 'fotosEvento', arquivo: File): Promise<string> => {
    return new Promise((resolve) => {
      // Simulação de upload - em produção, usar Supabase Storage
      const fakeUrl = `https://storage.example.com/${eventoId}/${tipo}/${arquivo.name}`;

      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          if (tipo === 'plantaBaixa') {
            return {
              ...evento,
              plantaBaixa: fakeUrl,
              atualizadoEm: new Date().toISOString()
            };
          } else if (tipo === 'documentos') {
            return {
              ...evento,
              documentos: [...(evento.documentos || []), fakeUrl],
              atualizadoEm: new Date().toISOString()
            };
          } else if (tipo === 'fotosEvento') {
            return {
              ...evento,
              fotosEvento: [...(evento.fotosEvento || []), fakeUrl],
              atualizadoEm: new Date().toISOString()
            };
          }
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'edicao', `Arquivo "${arquivo.name}" adicionado`);
      
      toast({
        title: 'Arquivo enviado!',
        description: `${arquivo.name} foi adicionado com sucesso.`
      });

      resolve(fakeUrl);
    });
  };

  const vincularReembolsoADespesa = async (eventoId: string, demandaId: string, descricao: string, valor: number, membroNome: string): Promise<void> => {
    return new Promise((resolve) => {
      const novaDespesa: Despesa = {
        id: `despesa-reembolso-${Date.now()}`,
        descricao: `Reembolso - ${membroNome} - ${descricao}`,
        categoria: 'Reembolso de Equipe',
        valor: valor,
        quantidade: 1,
        valorUnitario: valor,
        responsavel: membroNome,
        dataPagamento: new Date().toISOString(),
        status: 'pago',
        observacoes: `Vinculado à demanda de reembolso #${demandaId}`
      };

      setEventos(prev => prev.map(evento => {
        if (evento.id === eventoId) {
          return {
            ...evento,
            financeiro: {
              ...evento.financeiro,
              despesas: [...evento.financeiro.despesas, novaDespesa]
            },
            atualizadoEm: new Date().toISOString()
          };
        }
        return evento;
      }));

      adicionarTimeline(eventoId, 'financeiro', `Despesa de reembolso adicionada: ${membroNome} - R$ ${valor.toFixed(2)}`);
      
      toast({
        title: 'Despesa criada!',
        description: 'Reembolso vinculado ao financeiro do evento.',
      });

      resolve();
    });
  };

  return (
    <EventosContext.Provider value={{
      eventos,
      criarEvento,
      editarEvento,
      deletarEvento,
      alterarStatus,
      adicionarMaterialChecklist,
      removerMaterialChecklist,
      alocarMaterial,
      removerMaterialAlocado,
      adicionarReceita,
      removerReceita,
      adicionarDespesa,
      removerDespesa,
      adicionarMembroEquipe,
      removerMembroEquipe,
      adicionarObservacaoOperacional,
      uploadArquivo,
      vincularReembolsoADespesa
    }}>
      {children}
    </EventosContext.Provider>
  );
}

export function useEventos() {
  const context = useContext(EventosContext);
  if (!context) {
    throw new Error('useEventos must be used within EventosProvider');
  }
  return context;
}
