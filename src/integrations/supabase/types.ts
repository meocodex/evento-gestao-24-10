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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
