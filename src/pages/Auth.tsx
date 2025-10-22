import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Loader2, ShieldAlert } from "lucide-react";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ nome: "", email: "", password: "" });

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
