import { useState, useCallback } from 'react';

interface UseSheetStateOptions<T> {
  onOpen?: (data?: T) => void;
  onClose?: () => void;
  resetOnClose?: boolean;
}

export function useSheetState<T = any>(options: UseSheetStateOptions<T> = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>();

  const open = useCallback((newData?: T) => {
    setData(newData);
    setIsOpen(true);
    options.onOpen?.(newData);
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (options.resetOnClose) {
      setData(undefined);
    }
    options.onClose?.();
  }, [options]);

  const toggle = useCallback((newData?: T) => {
    if (isOpen) {
      close();
    } else {
      open(newData);
    }
  }, [isOpen, close, open]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
}
