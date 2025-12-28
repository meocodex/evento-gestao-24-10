import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

export function NavigationLoadingBar() {
  const location = useLocation();
  const isFetching = useIsFetching();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevLocationRef = useRef(location.pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Detecta mudança de rota
  useEffect(() => {
    if (prevLocationRef.current !== location.pathname) {
      setVisible(true);
      setProgress(20);
      prevLocationRef.current = location.pathname;
    }
  }, [location.pathname]);
  
  // Progresso baseado em queries pendentes (REAL)
  useEffect(() => {
    if (!visible) return;
    
    if (isFetching > 0) {
      // Queries em andamento - progresso gradual até 80%
      setProgress(prev => {
        if (prev < 80) {
          return Math.min(80, prev + (80 - prev) * 0.3);
        }
        return prev;
      });
    } else {
      // Sem queries pendentes - completar
      setProgress(100);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isFetching, visible]);
  
  // Garantir que a barra termine mesmo se não houver queries
  useEffect(() => {
    if (visible && isFetching === 0) {
      const fallbackTimer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
      }, 300);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [visible, isFetching]);
  
  if (!visible) return null;
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] transition-all duration-300 ease-out"
      style={{ 
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1 
      }}
    />
  );
}
