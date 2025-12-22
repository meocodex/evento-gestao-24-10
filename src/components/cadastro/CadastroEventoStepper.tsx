import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
}

interface CadastroEventoStepperProps {
  currentStep: number;
  totalSteps?: number;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { number: 1, label: 'Tipo' },
  { number: 2, label: 'Dados' },
  { number: 3, label: 'Produtor' },
  { number: 4, label: 'Config' },
  { number: 5, label: 'Obs' },
  { number: 6, label: 'Resumo' },
];

export function CadastroEventoStepper({ 
  currentStep, 
  steps = defaultSteps 
}: CadastroEventoStepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                    isCurrent && "bg-gradient-to-br from-primary via-[#A69548] to-accent text-primary-foreground ring-4 ring-primary/20 shadow-lg shadow-primary/40",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && "text-primary",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-8 sm:w-12 lg:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
