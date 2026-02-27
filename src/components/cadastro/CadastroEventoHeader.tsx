import logoTicketUp from '@/assets/logo-ticket-up.png';

interface CadastroEventoHeaderProps {
  subtitle?: string;
}

export function CadastroEventoHeader({ subtitle = "Cadastro de Evento" }: CadastroEventoHeaderProps) {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-3 mb-2">
        <img src={logoTicketUp} alt="Ticket Up" className="h-12 w-12 rounded-xl object-contain" />
        <h1 className="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-primary via-[#A69548] to-accent bg-clip-text text-transparent">
          Ticket Up
        </h1>
      </div>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
