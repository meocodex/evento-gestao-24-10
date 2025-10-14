import { useState } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
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
import { useUsuarios } from '@/hooks/useUsuarios';

interface ComercialSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ComercialSelect({ value, onChange }: ComercialSelectProps) {
  const [open, setOpen] = useState(false);
  const { usuarios } = useUsuarios();
  
  const comerciais = usuarios?.filter(u => u.role === 'comercial' || u.role === 'admin') || [];
  const selectedComercial = comerciais.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedComercial ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{selectedComercial.nome}</span>
            </div>
          ) : (
            "Selecione um comercial..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar comercial..." />
          <CommandList>
            <CommandEmpty>Nenhum comercial encontrado.</CommandEmpty>
            <CommandGroup>
              {comerciais.map((comercial) => (
                <CommandItem
                  key={comercial.id}
                  value={comercial.nome}
                  onSelect={() => {
                    onChange(comercial.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === comercial.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <User className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{comercial.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {comercial.email}
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
