import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Building } from 'lucide-react';
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
import { useContasPagar } from '@/hooks/financeiro';

interface FornecedorComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function FornecedorCombobox({ value, onChange }: FornecedorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { contas } = useContasPagar();

  // Extract unique suppliers from existing accounts
  const fornecedores = useMemo(() => {
    const uniqueFornecedores = new Set<string>();
    contas.forEach((conta) => {
      if (conta.fornecedor?.trim()) {
        uniqueFornecedores.add(conta.fornecedor.trim());
      }
    });
    return Array.from(uniqueFornecedores).sort();
  }, [contas]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || "Selecione ou digite um fornecedor..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar ou digitar fornecedor..." 
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue ? (
                <button
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded cursor-pointer"
                  onClick={() => handleSelect(inputValue)}
                >
                  Usar "{inputValue}"
                </button>
              ) : (
                "Digite um fornecedor..."
              )}
            </CommandEmpty>
            <CommandGroup heading="Fornecedores anteriores">
              {fornecedores.map((fornecedor) => (
                <CommandItem
                  key={fornecedor}
                  value={fornecedor}
                  onSelect={() => handleSelect(fornecedor)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === fornecedor ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  {fornecedor}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
