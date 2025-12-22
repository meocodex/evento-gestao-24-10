interface CadastroEventoHeaderProps {
  subtitle?: string;
}

export function CadastroEventoHeader({ subtitle = "Cadastro de Evento" }: CadastroEventoHeaderProps) {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B7E41] via-[#A69548] to-[#1E2433] flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-primary/20">
          <span className="text-white font-display font-bold text-2xl drop-shadow-md">T</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-primary via-[#A69548] to-accent bg-clip-text text-transparent">
          Ticket Up
        </h1>
      </div>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
