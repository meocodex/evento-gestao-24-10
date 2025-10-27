import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  maxLength?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Digite uma tag...",
  suggestions = [],
  maxTags = 10,
  maxLength = 50,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (!trimmedTag) return;
    
    if (value.length >= maxTags) {
      toast.error(`Máximo de ${maxTags} tags permitidas`);
      return;
    }
    
    if (trimmedTag.length > maxLength) {
      toast.error(`Tag deve ter no máximo ${maxLength} caracteres`);
      return;
    }
    
    if (value.includes(trimmedTag)) {
      toast.error("Esta tag já foi adicionada");
      return;
    }
    
    onChange([...value, trimmedTag]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
        >
          Adicionar
        </Button>
      </div>

      {suggestions.length > 0 && value.length < maxTags && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Sugestões:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions
              .filter((s) => !value.includes(s))
              .map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => addTag(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag} variant="default" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
