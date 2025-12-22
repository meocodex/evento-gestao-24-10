import { ReactNode } from 'react';
import { CadastroEventoHeader } from './CadastroEventoHeader';
import { CadastroEventoStepper } from './CadastroEventoStepper';

interface CadastroEventoLayoutProps {
  children: ReactNode;
  currentStep: number;
  showStepper?: boolean;
  subtitle?: string;
}

export function CadastroEventoLayout({ 
  children, 
  currentStep, 
  showStepper = true,
  subtitle 
}: CadastroEventoLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <CadastroEventoHeader subtitle={subtitle} />
        
        {showStepper && (
          <CadastroEventoStepper currentStep={currentStep} />
        )}
        
        <div className="mt-6">
          {children}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Dúvidas? Entre em contato com nosso suporte pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}
