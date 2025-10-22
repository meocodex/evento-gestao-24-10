import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { GerenciarPermissoes } from "./GerenciarPermissoes";
import { TemplatesPermissoes } from "./TemplatesPermissoes";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CriarOperadorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CriarOperadorDialog({ open, onOpenChange }: CriarOperadorDialogProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"sistema" | "operacional">("sistema");
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);

  const { criarOperador } = useUsuarios();

  // Buscar todas as permissões para o caso de Admin
  const { data: todasPermissoes = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await supabase.from('permissions').select('id');
      return data?.map(p => p.id) || [];
    },
  });

  const handleTemplateSelect = (permissions: string[]) => {
    // Se array vazio, significa Admin (todas permissões)
    if (permissions.length === 0) {
      setPermissoesSelecionadas(todasPermissoes);
    } else {
      setPermissoesSelecionadas(permissions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !senha) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (permissoesSelecionadas.length === 0) {
      toast.error("Selecione ao menos uma permissão");
      return;
    }

    criarOperador.mutate(
      {
        nome,
        email,
        cpf,
        telefone,
        senha,
        tipo,
        permissions: permissoesSelecionadas
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNome("");
          setEmail("");
          setCpf("");
          setTelefone("");
          setSenha("");
          setTipo("sistema");
          setPermissoesSelecionadas([]);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="dados" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do usuário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Senha temporária"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="template">
              <TemplatesPermissoes 
                onSelectTemplate={handleTemplateSelect}
                disabled={criarOperador.isPending}
              />
            </TabsContent>

            <TabsContent value="permissoes">
              <GerenciarPermissoes
                userId=""
                userPermissions={permissoesSelecionadas}
                onPermissionsChange={setPermissoesSelecionadas}
                disabled={criarOperador.isPending}
              />
            </TabsContent>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={criarOperador.isPending}
              >
                {criarOperador.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
