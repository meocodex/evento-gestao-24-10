import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Loader2, ShieldAlert, UserCog } from "lucide-react";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);
  const [hasUsers, setHasUsers] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ nome: "", email: "", password: "" });
  const [setupData, setSetupData] = useState({ 
    nome: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    telefone: "",
    cpf: "" 
  });

  // Verificar se existem usuários no sistema usando RPC seguro
  useEffect(() => {
    const checkExistingUsers = async () => {
      try {
        const { data, error } = await supabase.rpc('system_has_users');

        if (error) {
          console.error('Erro ao verificar usuários:', error);
          setHasUsers(true); // Em caso de erro, assume que há usuários (mais seguro)
        } else {
          setHasUsers(data === true);
        }
      } catch (error) {
        console.error('Erro ao verificar usuários:', error);
        setHasUsers(true);
      } finally {
        setCheckingUsers(false);
      }
    };

    checkExistingUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar input com Zod
      const validatedData = loginSchema.parse({
        email: loginData.email,
        password: loginData.password,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        // Rate limiting do Supabase
        if (error.message.includes("Email rate limit exceeded")) {
          toast.error("Muitas tentativas. Aguarde alguns minutos.", {
            icon: <ShieldAlert className="h-4 w-4" />,
          });
          return;
        }
        
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error("Erro ao fazer login");
        }
        return;
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        // Redirecionamento automático via AuthRoutes
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Mostrar primeiro erro de validação
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar input com Zod (inclui validação robusta de senha)
      const validatedData = signupSchema.parse({
        nome: signupData.nome,
        email: signupData.email,
        password: signupData.password,
      });

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            nome: validatedData.nome,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        // Rate limiting do Supabase
        if (error.message.includes("Email rate limit exceeded")) {
          toast.error("Muitas tentativas. Aguarde alguns minutos.", {
            icon: <ShieldAlert className="h-4 w-4" />,
          });
          return;
        }
        
        // Senha vazada detectada pelo Supabase
        if (error.message.includes("Password is too weak") || 
            error.message.includes("breached password")) {
          toast.error("Esta senha foi encontrada em vazamentos de dados. Escolha uma senha mais segura.", {
            icon: <ShieldAlert className="h-4 w-4" />,
            duration: 5000,
          });
          return;
        }
        
        if (error.message.includes("already registered")) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error("Erro ao criar conta");
        }
        return;
      }

      if (data.user) {
        toast.success("Conta criada com sucesso!");
        // Redirecionamento automático via AuthRoutes
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Mostrar primeiro erro de validação de forma clara
        const firstError = error.errors[0];
        toast.error(firstError.message, {
          description: firstError.path.join('.'),
          duration: 4000,
        });
      } else {
        toast.error("Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetupFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar senhas coincidem
      if (setupData.password !== setupData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      // Validar com schema de signup
      const validatedData = signupSchema.parse({
        nome: setupData.nome,
        email: setupData.email,
        password: setupData.password,
      });

      // Chamar Edge Function para criar primeiro admin
      const { data, error } = await supabase.functions.invoke('setup-first-admin', {
        body: {
          nome: validatedData.nome,
          email: validatedData.email,
          password: validatedData.password,
          telefone: setupData.telefone || null,
          cpf: setupData.cpf || null,
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar administrador');
      }

      toast.success("Primeiro administrador criado com sucesso! Você já pode fazer login.");
      
      // Atualizar estado para mostrar tela de login
      setHasUsers(true);
      
      // Preencher campos de login com os dados criados
      setLoginData({
        email: setupData.email,
        password: setupData.password,
      });

    } catch (error: any) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message, {
          description: firstError.path.join('.'),
          duration: 4000,
        });
      } else {
        const errorMsg = error.message || "Erro ao criar administrador";
        
        // Se for erro de duplicação ou usuário já existe, orientar login
        if (errorMsg.includes('duplicate') || errorMsg.includes('já está cadastrado') || errorMsg.includes('already registered')) {
          toast.success("Usuário já cadastrado. Use as credenciais informadas para fazer login.");
          
          // Preencher formulário de login
          setLoginData({
            email: setupData.email,
            password: setupData.password,
          });
          
          // Alternar para tela de login
          setHasUsers(true);
        } else {
          toast.error(errorMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checkingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Setup inicial: primeiro admin
  if (!hasUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Calendar className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EventFlow
              </h1>
            </div>
            <p className="text-muted-foreground">
              Sistema de Gestão de Eventos
            </p>
          </div>

          <Card className="border-border/50 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <UserCog className="h-6 w-6 text-primary" />
                <CardTitle>Setup Inicial</CardTitle>
              </div>
              <CardDescription>
                Configure o primeiro administrador do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetupFirstAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-nome">Nome Completo</Label>
                  <Input
                    id="setup-nome"
                    type="text"
                    placeholder="João Silva"
                    value={setupData.nome}
                    onChange={(e) => setSetupData({ ...setupData, nome: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setup-email">Email</Label>
                  <Input
                    id="setup-email"
                    type="email"
                    placeholder="admin@empresa.com"
                    value={setupData.email}
                    onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-telefone">Telefone (opcional)</Label>
                  <Input
                    id="setup-telefone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={setupData.telefone}
                    onChange={(e) => setSetupData({ ...setupData, telefone: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-cpf">CPF (opcional)</Label>
                  <Input
                    id="setup-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={setupData.cpf}
                    onChange={(e) => setSetupData({ ...setupData, cpf: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-password">Senha</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    placeholder="••••••••"
                    value={setupData.password}
                    onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">A senha deve conter:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-1">
                      <li>Mínimo 8 caracteres</li>
                      <li>Letras maiúsculas e minúsculas</li>
                      <li>Pelo menos um número</li>
                      <li>Pelo menos um caractere especial</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-confirm-password">Confirmar Senha</Label>
                  <Input
                    id="setup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={setupData.confirmPassword}
                    onChange={(e) => setSetupData({ ...setupData, confirmPassword: e.target.value })}
                    disabled={loading}
                    required
                    minLength={8}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando administrador...
                    </>
                  ) : (
                    <>
                      <UserCog className="mr-2 h-4 w-4" />
                      Criar Primeiro Administrador
                    </>
                  )}
                </Button>

                {/* Fallback: permitir acesso ao login caso detecção falhe */}
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setHasUsers(true)}
                  disabled={loading}
                >
                  Já tenho conta
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Importante:</strong> Esta conta terá acesso total ao sistema.<br />
              Guarde as credenciais com segurança.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Calendar className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EventFlow
            </h1>
          </div>
          <p className="text-muted-foreground">
            Sistema de Gestão de Eventos
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>
              Entre com sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              {/* Tab de Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Tab de Signup */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signupData.nome}
                      onChange={(e) =>
                        setSignupData({ ...signupData, nome: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      disabled={loading}
                      required
                      minLength={8}
                    />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">A senha deve conter:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-1">
                        <li>Mínimo 8 caracteres</li>
                        <li>Letras maiúsculas e minúsculas</li>
                        <li>Pelo menos um número</li>
                        <li>Pelo menos um caractere especial</li>
                      </ul>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Primeiro usuário:</strong> Será automaticamente Admin<br />
            <strong>Demais usuários:</strong> Serão Comercial por padrão
          </p>
        </div>
      </div>
    </div>
  );
}
