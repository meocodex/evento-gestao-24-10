import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TemplatesPermissoesProps {
  onSelectTemplate: (permissions: string[]) => void;
  disabled?: boolean;
}

const TEMPLATES = {
  admin: {
    nome: "Administrador",
    descricao: "Acesso completo a todas as funcionalidades do sistema",
    cor: "destructive" as const,
    permissions: [] as string[] // Array vazio = todas permissões
  },
  comercial: {
    nome: "Comercial",
    descricao: "Gerenciar eventos, clientes e contratos próprios",
    cor: "default" as const,
    permissions: [
      'eventos.visualizar', 'eventos.visualizar_proprios', 'eventos.criar', 'eventos.editar_proprios', 'eventos.alterar_status',
      'financeiro.visualizar_proprios',
      'clientes.visualizar', 'clientes.criar', 'clientes.editar',
      'estoque.visualizar',
      'contratos.visualizar', 'contratos.criar', 'contratos.editar',
      'demandas.visualizar', 'demandas.criar',
      'equipe.visualizar',
      'relatorios.visualizar',
      'configuracoes.visualizar'
    ]
  },
  suporte: {
    nome: "Suporte Técnico",
    descricao: "Gerenciar estoque, transportadoras e operações",
    cor: "secondary" as const,
    permissions: [
      'eventos.visualizar',
      'estoque.visualizar', 'estoque.criar', 'estoque.editar', 'estoque.alocar', 'estoque.seriais',
      'transportadoras.visualizar', 'transportadoras.criar', 'transportadoras.editar', 'transportadoras.gerenciar_envios',
      'demandas.visualizar', 'demandas.criar', 'demandas.editar', 'demandas.atribuir',
      'equipe.visualizar', 'equipe.criar', 'equipe.editar',
      'configuracoes.visualizar'
    ]
  },
  operacional: {
    nome: "Operacional",
    descricao: "Acesso básico para execução de eventos",
    cor: "outline" as const,
    permissions: [
      'eventos.visualizar',
      'estoque.visualizar',
      'demandas.visualizar', 'demandas.criar',
      'equipe.visualizar'
    ]
  }
};

export function TemplatesPermissoes({ onSelectTemplate, disabled = false }: TemplatesPermissoesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates de Permissões</CardTitle>
        <CardDescription>
          Selecione um template pré-configurado para começar
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(TEMPLATES).map(([key, template]) => (
          <Button
            key={key}
            variant={template.cor}
            className="h-auto flex flex-col items-start gap-2 p-4"
            onClick={() => onSelectTemplate(template.permissions)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 w-full">
              <Check className="h-4 w-4" />
              <span className="font-semibold">{template.nome}</span>
            </div>
            <span className="text-xs font-normal text-left opacity-80">
              {template.descricao}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
