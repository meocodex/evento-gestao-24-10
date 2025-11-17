import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
  <div className="flex items-center gap-1.5">
    {met ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500 flex-shrink-0" />
    ) : (
      <XCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
    )}
    <span className={`text-xs ${met ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
    </span>
  </div>
);

// Lista de senhas comuns (parcial - em produção use uma lista mais completa)
const COMMON_PASSWORDS = [
  'password', 'password1', 'password123', '12345678', '123456789',
  'qwerty', 'abc123', 'monkey', '1234567890', 'admin',
  'letmein', 'welcome', 'login', 'admin123', 'root',
  'Password1', 'Password1!', 'Admin123!', 'Welcome1!',
  '12345678', '123456789', '1234567890'
];

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !COMMON_PASSWORDS.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    )
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const percentage = (strength / 6) * 100;

  const strengthConfig: Record<number, { label: string; color: string; textColor: string }> = {
    0: { label: 'Muito fraca', color: 'bg-destructive', textColor: 'text-destructive' },
    1: { label: 'Muito fraca', color: 'bg-destructive', textColor: 'text-destructive' },
    2: { label: 'Fraca', color: 'bg-orange-500', textColor: 'text-orange-500' },
    3: { label: 'Fraca', color: 'bg-orange-400', textColor: 'text-orange-400' },
    4: { label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    5: { label: 'Forte', color: 'bg-green-500', textColor: 'text-green-500' },
    6: { label: 'Muito Forte', color: 'bg-green-600', textColor: 'text-green-600' }
  };

  const config = strengthConfig[strength];

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
      {/* Barra de progresso */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-foreground">Força da senha:</span>
          <span className={`text-xs font-bold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-2"
        />
      </div>

      {/* Lista de requisitos */}
      <div className="grid grid-cols-2 gap-2">
        <RequirementItem label="8+ caracteres" met={checks.length} />
        <RequirementItem label="Minúscula (a-z)" met={checks.lowercase} />
        <RequirementItem label="Maiúscula (A-Z)" met={checks.uppercase} />
        <RequirementItem label="Número (0-9)" met={checks.number} />
        <RequirementItem label="Especial (!@#$)" met={checks.special} />
        <RequirementItem label="Não comum" met={checks.notCommon} />
      </div>

      {strength < 5 && (
        <p className="text-xs text-muted-foreground italic">
          💡 Complete todos os requisitos para uma senha forte
        </p>
      )}
    </div>
  );
};
