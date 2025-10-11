export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cadastros_publicos: {
        Row: {
          cidade: string
          configuracao_bar: Json | null
          configuracao_ingresso: Json | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          endereco: string
          estado: string
          evento_id: string | null
          hora_fim: string
          hora_inicio: string
          id: string
          local: string
          nome: string
          observacoes_internas: string | null
          produtor: Json
          protocolo: string
          status: string
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          updated_at: string | null
        }
        Insert: {
          cidade: string
          configuracao_bar?: Json | null
          configuracao_ingresso?: Json | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          endereco: string
          estado: string
          evento_id?: string | null
          hora_fim: string
          hora_inicio: string
          id?: string
          local: string
          nome: string
          observacoes_internas?: string | null
          produtor: Json
          protocolo: string
          status?: string
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string | null
        }
        Update: {
          cidade?: string
          configuracao_bar?: Json | null
          configuracao_ingresso?: Json | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          endereco?: string
          estado?: string
          evento_id?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          local?: string
          nome?: string
          observacoes_internas?: string | null
          produtor?: Json
          protocolo?: string
          status?: string
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastros_publicos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string | null
          created_by: string | null
          documento: string
          email: string
          endereco: Json
          id: string
          nome: string
          telefone: string
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          documento: string
          email: string
          endereco?: Json
          id?: string
          nome: string
          telefone: string
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          documento?: string
          email?: string
          endereco?: Json
          id?: string
          nome?: string
          telefone?: string
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          anexos: string[] | null
          aprovacoes_historico: Json | null
          assinaturas: Json
          cliente_id: string | null
          condicoes_pagamento: string | null
          conteudo: string
          created_at: string | null
          dados_evento: Json | null
          data_fim: string | null
          data_inicio: string | null
          evento_id: string | null
          garantia: string | null
          id: string
          itens: Json | null
          numero: string
          observacoes: string | null
          observacoes_comerciais: string | null
          prazo_execucao: string | null
          status: Database["public"]["Enums"]["status_contrato"]
          template_id: string | null
          tipo: string
          titulo: string
          updated_at: string | null
          validade: string | null
          valor: number | null
        }
        Insert: {
          anexos?: string[] | null
          aprovacoes_historico?: Json | null
          assinaturas?: Json
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          conteudo: string
          created_at?: string | null
          dados_evento?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          evento_id?: string | null
          garantia?: string | null
          id?: string
          itens?: Json | null
          numero: string
          observacoes?: string | null
          observacoes_comerciais?: string | null
          prazo_execucao?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          template_id?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
          validade?: string | null
          valor?: number | null
        }
        Update: {
          anexos?: string[] | null
          aprovacoes_historico?: Json | null
          assinaturas?: Json
          cliente_id?: string | null
          condicoes_pagamento?: string | null
          conteudo?: string
          created_at?: string | null
          dados_evento?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          evento_id?: string | null
          garantia?: string | null
          id?: string
          itens?: Json | null
          numero?: string
          observacoes?: string | null
          observacoes_comerciais?: string | null
          prazo_execucao?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          template_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          validade?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contratos_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_templates: {
        Row: {
          conteudo: string
          created_at: string | null
          descricao: string
          id: string
          margens: Json | null
          nome: string
          papel_timbrado: string | null
          status: string
          tipo: string
          updated_at: string | null
          variaveis: string[] | null
          versao: number
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          descricao: string
          id?: string
          margens?: Json | null
          nome: string
          papel_timbrado?: string | null
          status?: string
          tipo: string
          updated_at?: string | null
          variaveis?: string[] | null
          versao?: number
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          descricao?: string
          id?: string
          margens?: Json | null
          nome?: string
          papel_timbrado?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
          variaveis?: string[] | null
          versao?: number
        }
        Relationships: []
      }
      demandas: {
        Row: {
          arquivada: boolean | null
          categoria: Database["public"]["Enums"]["categoria_demanda"]
          created_at: string | null
          dados_reembolso: Json | null
          data_conclusao: string | null
          descricao: string
          evento_id: string | null
          evento_nome: string | null
          id: string
          prazo: string | null
          prioridade: Database["public"]["Enums"]["prioridade_demanda"]
          resolvida: boolean | null
          responsavel: string | null
          responsavel_id: string | null
          solicitante: string
          solicitante_id: string | null
          status: Database["public"]["Enums"]["status_demanda"]
          tags: string[] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          arquivada?: boolean | null
          categoria: Database["public"]["Enums"]["categoria_demanda"]
          created_at?: string | null
          dados_reembolso?: Json | null
          data_conclusao?: string | null
          descricao: string
          evento_id?: string | null
          evento_nome?: string | null
          id?: string
          prazo?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_demanda"]
          resolvida?: boolean | null
          responsavel?: string | null
          responsavel_id?: string | null
          solicitante: string
          solicitante_id?: string | null
          status?: Database["public"]["Enums"]["status_demanda"]
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          arquivada?: boolean | null
          categoria?: Database["public"]["Enums"]["categoria_demanda"]
          created_at?: string | null
          dados_reembolso?: Json | null
          data_conclusao?: string | null
          descricao?: string
          evento_id?: string | null
          evento_nome?: string | null
          id?: string
          prazo?: string | null
          prioridade?: Database["public"]["Enums"]["prioridade_demanda"]
          resolvida?: boolean | null
          responsavel?: string | null
          responsavel_id?: string | null
          solicitante?: string
          solicitante_id?: string | null
          status?: Database["public"]["Enums"]["status_demanda"]
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      demandas_anexos: {
        Row: {
          created_at: string | null
          demanda_id: string
          id: string
          nome: string
          tamanho: number
          tipo: string
          upload_por: string
          url: string
        }
        Insert: {
          created_at?: string | null
          demanda_id: string
          id?: string
          nome: string
          tamanho: number
          tipo: string
          upload_por: string
          url: string
        }
        Update: {
          created_at?: string | null
          demanda_id?: string
          id?: string
          nome?: string
          tamanho?: number
          tipo?: string
          upload_por?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandas_anexos_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      demandas_comentarios: {
        Row: {
          autor: string
          autor_id: string | null
          conteudo: string
          created_at: string | null
          demanda_id: string
          id: string
          tipo: string
        }
        Insert: {
          autor: string
          autor_id?: string | null
          conteudo: string
          created_at?: string | null
          demanda_id: string
          id?: string
          tipo: string
        }
        Update: {
          autor?: string
          autor_id?: string | null
          conteudo?: string
          created_at?: string | null
          demanda_id?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "demandas_comentarios_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      envios: {
        Row: {
          comprovante_pagamento: string | null
          created_at: string | null
          data_coleta: string | null
          data_entrega: string | null
          data_entrega_prevista: string
          despesa_evento_id: string | null
          destino: string
          evento_id: string | null
          forma_pagamento: string
          id: string
          observacoes: string | null
          origem: string
          rastreio: string | null
          status: string
          tipo: string
          transportadora_id: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          comprovante_pagamento?: string | null
          created_at?: string | null
          data_coleta?: string | null
          data_entrega?: string | null
          data_entrega_prevista: string
          despesa_evento_id?: string | null
          destino: string
          evento_id?: string | null
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          origem: string
          rastreio?: string | null
          status?: string
          tipo: string
          transportadora_id?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          comprovante_pagamento?: string | null
          created_at?: string | null
          data_coleta?: string | null
          data_entrega?: string | null
          data_entrega_prevista?: string
          despesa_evento_id?: string | null
          destino?: string
          evento_id?: string | null
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          origem?: string
          rastreio?: string | null
          status?: string
          tipo?: string
          transportadora_id?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "envios_despesa_evento_id_fkey"
            columns: ["despesa_evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envios_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cidade: string
          cliente_id: string | null
          comercial_id: string | null
          configuracao_bar: Json | null
          configuracao_ingresso: Json | null
          contatos_adicionais: string | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          documentos: string[] | null
          endereco: string
          estado: string
          fotos_evento: string[] | null
          hora_fim: string
          hora_inicio: string
          id: string
          local: string
          nome: string
          observacoes: string | null
          observacoes_operacionais: string[] | null
          planta_baixa: string | null
          redes_sociais: string | null
          status: Database["public"]["Enums"]["status_evento"]
          tags: string[] | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          updated_at: string | null
        }
        Insert: {
          cidade: string
          cliente_id?: string | null
          comercial_id?: string | null
          configuracao_bar?: Json | null
          configuracao_ingresso?: Json | null
          contatos_adicionais?: string | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          documentos?: string[] | null
          endereco: string
          estado: string
          fotos_evento?: string[] | null
          hora_fim: string
          hora_inicio: string
          id?: string
          local: string
          nome: string
          observacoes?: string | null
          observacoes_operacionais?: string[] | null
          planta_baixa?: string | null
          redes_sociais?: string | null
          status?: Database["public"]["Enums"]["status_evento"]
          tags?: string[] | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string | null
        }
        Update: {
          cidade?: string
          cliente_id?: string | null
          comercial_id?: string | null
          configuracao_bar?: Json | null
          configuracao_ingresso?: Json | null
          contatos_adicionais?: string | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          documentos?: string[] | null
          endereco?: string
          estado?: string
          fotos_evento?: string[] | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          local?: string
          nome?: string
          observacoes?: string | null
          observacoes_operacionais?: string[] | null
          planta_baixa?: string | null
          redes_sociais?: string | null
          status?: Database["public"]["Enums"]["status_evento"]
          tags?: string[] | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_checklist: {
        Row: {
          alocado: number
          created_at: string | null
          evento_id: string
          id: string
          item_id: string
          nome: string
          quantidade: number
          updated_at: string | null
        }
        Insert: {
          alocado?: number
          created_at?: string | null
          evento_id: string
          id?: string
          item_id: string
          nome: string
          quantidade?: number
          updated_at?: string | null
        }
        Update: {
          alocado?: number
          created_at?: string | null
          evento_id?: string
          id?: string
          item_id?: string
          nome?: string
          quantidade?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_checklist_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_cobrancas: {
        Row: {
          created_at: string | null
          evento_id: string
          id: string
          item: string
          motivo: string
          observacao: string | null
          serial: string
          status: Database["public"]["Enums"]["status_financeiro"]
          valor: number
        }
        Insert: {
          created_at?: string | null
          evento_id: string
          id?: string
          item: string
          motivo: string
          observacao?: string | null
          serial: string
          status?: Database["public"]["Enums"]["status_financeiro"]
          valor: number
        }
        Update: {
          created_at?: string | null
          evento_id?: string
          id?: string
          item?: string
          motivo?: string
          observacao?: string | null
          serial?: string
          status?: Database["public"]["Enums"]["status_financeiro"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cobrancas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_despesas: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_financeira"]
          comprovante: string | null
          created_at: string | null
          data: string | null
          data_pagamento: string | null
          descricao: string
          evento_id: string
          id: string
          observacoes: string | null
          quantidade: number
          responsavel: string | null
          selecionada_relatorio: boolean | null
          status: Database["public"]["Enums"]["status_financeiro"] | null
          updated_at: string | null
          valor: number
          valor_unitario: number
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_financeira"]
          comprovante?: string | null
          created_at?: string | null
          data?: string | null
          data_pagamento?: string | null
          descricao: string
          evento_id: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          responsavel?: string | null
          selecionada_relatorio?: boolean | null
          status?: Database["public"]["Enums"]["status_financeiro"] | null
          updated_at?: string | null
          valor: number
          valor_unitario: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_financeira"]
          comprovante?: string | null
          created_at?: string | null
          data?: string | null
          data_pagamento?: string | null
          descricao?: string
          evento_id?: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          responsavel?: string | null
          selecionada_relatorio?: boolean | null
          status?: Database["public"]["Enums"]["status_financeiro"] | null
          updated_at?: string | null
          valor?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_despesas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_equipe: {
        Row: {
          created_at: string | null
          evento_id: string
          funcao: string
          id: string
          nome: string
          telefone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evento_id: string
          funcao: string
          id?: string
          nome: string
          telefone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evento_id?: string
          funcao?: string
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_equipe_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_materiais_alocados: {
        Row: {
          created_at: string | null
          data_envio: string | null
          evento_id: string
          id: string
          item_id: string
          nome: string
          rastreamento: string | null
          responsavel: string | null
          serial: string
          status: Database["public"]["Enums"]["status_material"]
          tipo_envio: Database["public"]["Enums"]["tipo_envio"]
          transportadora: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_envio?: string | null
          evento_id: string
          id?: string
          item_id: string
          nome: string
          rastreamento?: string | null
          responsavel?: string | null
          serial: string
          status?: Database["public"]["Enums"]["status_material"]
          tipo_envio: Database["public"]["Enums"]["tipo_envio"]
          transportadora?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_envio?: string | null
          evento_id?: string
          id?: string
          item_id?: string
          nome?: string
          rastreamento?: string | null
          responsavel?: string | null
          serial?: string
          status?: Database["public"]["Enums"]["status_material"]
          tipo_envio?: Database["public"]["Enums"]["tipo_envio"]
          transportadora?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_materiais_alocados_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_receitas: {
        Row: {
          comprovante: string | null
          created_at: string | null
          data: string
          descricao: string
          evento_id: string
          id: string
          quantidade: number
          status: Database["public"]["Enums"]["status_financeiro"]
          tipo: Database["public"]["Enums"]["tipo_receita"]
          updated_at: string | null
          valor: number
          valor_unitario: number
        }
        Insert: {
          comprovante?: string | null
          created_at?: string | null
          data: string
          descricao: string
          evento_id: string
          id?: string
          quantidade?: number
          status?: Database["public"]["Enums"]["status_financeiro"]
          tipo: Database["public"]["Enums"]["tipo_receita"]
          updated_at?: string | null
          valor: number
          valor_unitario: number
        }
        Update: {
          comprovante?: string | null
          created_at?: string | null
          data?: string
          descricao?: string
          evento_id?: string
          id?: string
          quantidade?: number
          status?: Database["public"]["Enums"]["status_financeiro"]
          tipo?: Database["public"]["Enums"]["tipo_receita"]
          updated_at?: string | null
          valor?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_receitas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_timeline: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          evento_id: string
          id: string
          tipo: Database["public"]["Enums"]["tipo_timeline"]
          usuario: string
        }
        Insert: {
          created_at?: string | null
          data?: string
          descricao: string
          evento_id: string
          id?: string
          tipo: Database["public"]["Enums"]["tipo_timeline"]
          usuario: string
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          evento_id?: string
          id?: string
          tipo?: Database["public"]["Enums"]["tipo_timeline"]
          usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_timeline_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_estoque: {
        Row: {
          categoria: string
          created_at: string | null
          descricao: string | null
          foto: string | null
          id: string
          nome: string
          quantidade_disponivel: number
          quantidade_total: number
          updated_at: string | null
          valor_unitario: number | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descricao?: string | null
          foto?: string | null
          id: string
          nome: string
          quantidade_disponivel?: number
          quantidade_total?: number
          updated_at?: string | null
          valor_unitario?: number | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          foto?: string | null
          id?: string
          nome?: string
          quantidade_disponivel?: number
          quantidade_total?: number
          updated_at?: string | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      materiais_seriais: {
        Row: {
          created_at: string | null
          data_aquisicao: string | null
          localizacao: string
          material_id: string
          numero: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_serial"]
          ultima_manutencao: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_aquisicao?: string | null
          localizacao: string
          material_id: string
          numero: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_serial"]
          ultima_manutencao?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_aquisicao?: string | null
          localizacao?: string
          material_id?: string
          numero?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_serial"]
          ultima_manutencao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_seriais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_estoque"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transportadoras: {
        Row: {
          cnpj: string
          created_at: string | null
          dados_bancarios: Json | null
          email: string
          endereco: Json
          id: string
          nome: string
          observacoes: string | null
          razao_social: string
          responsavel: string
          status: string
          telefone: string
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          dados_bancarios?: Json | null
          email: string
          endereco: Json
          id?: string
          nome: string
          observacoes?: string | null
          razao_social: string
          responsavel: string
          status?: string
          telefone: string
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          dados_bancarios?: Json | null
          email?: string
          endereco?: Json
          id?: string
          nome?: string
          observacoes?: string | null
          razao_social?: string
          responsavel?: string
          status?: string
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transportadoras_rotas: {
        Row: {
          ativa: boolean | null
          cidade_destino: string
          created_at: string | null
          estado_destino: string
          id: string
          prazo_entrega: number
          transportadora_id: string
          updated_at: string | null
          valor_base: number | null
        }
        Insert: {
          ativa?: boolean | null
          cidade_destino: string
          created_at?: string | null
          estado_destino: string
          id?: string
          prazo_entrega: number
          transportadora_id: string
          updated_at?: string | null
          valor_base?: number | null
        }
        Update: {
          ativa?: boolean | null
          cidade_destino?: string
          created_at?: string | null
          estado_destino?: string
          id?: string
          prazo_entrega?: number
          transportadora_id?: string
          updated_at?: string | null
          valor_base?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transportadoras_rotas_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "transportadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_checklist_alocado: {
        Args: { p_evento_id: string; p_item_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_checklist_alocado: {
        Args: { p_evento_id: string; p_item_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "comercial" | "suporte"
      categoria_demanda:
        | "tecnica"
        | "operacional"
        | "comercial"
        | "financeira"
        | "administrativa"
        | "reembolso"
        | "outra"
      categoria_financeira:
        | "pessoal"
        | "transporte"
        | "insumos"
        | "alimentacao"
        | "Reembolso de Equipe"
        | "outros"
      prioridade_demanda: "baixa" | "media" | "alta" | "urgente"
      status_contrato:
        | "proposta"
        | "em_negociacao"
        | "aprovada"
        | "rascunho"
        | "em_revisao"
        | "aguardando_assinatura"
        | "assinado"
        | "cancelado"
        | "expirado"
      status_demanda: "aberta" | "em-andamento" | "concluida" | "cancelada"
      status_evento:
        | "orcamento_enviado"
        | "confirmado"
        | "materiais_alocados"
        | "em_preparacao"
        | "em_andamento"
        | "aguardando_retorno"
        | "aguardando_fechamento"
        | "finalizado"
        | "cancelado"
        | "aguardando_alocacao"
      status_financeiro: "pendente" | "pago" | "cancelado" | "em_negociacao"
      status_material:
        | "reservado"
        | "separado"
        | "em_transito"
        | "entregue"
        | "preparado"
      status_serial: "disponivel" | "em-uso" | "manutencao"
      tipo_cliente: "CPF" | "CNPJ"
      tipo_envio: "antecipado" | "com_tecnicos"
      tipo_evento: "ingresso" | "bar" | "hibrido"
      tipo_receita: "fixo" | "quantidade"
      tipo_timeline:
        | "criacao"
        | "edicao"
        | "confirmacao"
        | "alocacao"
        | "envio"
        | "entrega"
        | "execucao"
        | "retorno"
        | "fechamento"
        | "cancelamento"
        | "financeiro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "comercial", "suporte"],
      categoria_demanda: [
        "tecnica",
        "operacional",
        "comercial",
        "financeira",
        "administrativa",
        "reembolso",
        "outra",
      ],
      categoria_financeira: [
        "pessoal",
        "transporte",
        "insumos",
        "alimentacao",
        "Reembolso de Equipe",
        "outros",
      ],
      prioridade_demanda: ["baixa", "media", "alta", "urgente"],
      status_contrato: [
        "proposta",
        "em_negociacao",
        "aprovada",
        "rascunho",
        "em_revisao",
        "aguardando_assinatura",
        "assinado",
        "cancelado",
        "expirado",
      ],
      status_demanda: ["aberta", "em-andamento", "concluida", "cancelada"],
      status_evento: [
        "orcamento_enviado",
        "confirmado",
        "materiais_alocados",
        "em_preparacao",
        "em_andamento",
        "aguardando_retorno",
        "aguardando_fechamento",
        "finalizado",
        "cancelado",
        "aguardando_alocacao",
      ],
      status_financeiro: ["pendente", "pago", "cancelado", "em_negociacao"],
      status_material: [
        "reservado",
        "separado",
        "em_transito",
        "entregue",
        "preparado",
      ],
      status_serial: ["disponivel", "em-uso", "manutencao"],
      tipo_cliente: ["CPF", "CNPJ"],
      tipo_envio: ["antecipado", "com_tecnicos"],
      tipo_evento: ["ingresso", "bar", "hibrido"],
      tipo_receita: ["fixo", "quantidade"],
      tipo_timeline: [
        "criacao",
        "edicao",
        "confirmacao",
        "alocacao",
        "envio",
        "entrega",
        "execucao",
        "retorno",
        "fechamento",
        "cancelamento",
        "financeiro",
      ],
    },
  },
} as const
