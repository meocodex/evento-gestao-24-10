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
import { useClientes } from '@/hooks/clientes';

interface ClienteSelectFinanceiroProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClienteSelectFinanceiro({ value, onChange }: ClienteSelectFinanceiroProps) {
  const [open, setOpen] = useState(false);
  const { clientes } = useClientes();

  // Find by name since we store the name, not the ID
  const selectedCliente = clientes.find(c => c.nome === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
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
          ) : value ? (
            <span>{value}</span>
          ) : (
            "Selecione um cliente..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {clientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={cliente.nome}
                  onSelect={() => {
                    onChange(cliente.nome);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cliente.nome ? "opacity-100" : "opacity-0"
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
                      {cliente.documento}
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
