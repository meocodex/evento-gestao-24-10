import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { mockClientes } from '@/lib/mock-data/clientes';

interface ClienteSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClienteSelect({ value, onChange }: ClienteSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCliente = mockClientes.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCliente ? (
            <div className="flex items-center gap-2">
              {selectedCliente.tipo === 'CPF' ? (
                <User className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span>{selectedCliente.nome}</span>
            </div>
          ) : (
            "Selecione um cliente..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {mockClientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={cliente.nome}
                  onSelect={() => {
                    onChange(cliente.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cliente.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cliente.tipo === 'CPF' ? (
                    <User className="mr-2 h-4 w-4" />
                  ) : (
                    <Building2 className="mr-2 h-4 w-4" />
                  )}
                  <div className="flex flex-col">
                    <span>{cliente.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {cliente.documento} • {cliente.endereco.cidade}/{cliente.endereco.estado}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
