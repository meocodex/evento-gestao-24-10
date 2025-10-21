import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function NavigationLoadingBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevLocationRef = useRef(location.pathname);
  
  useEffect(() => {
    // Detecta mudança de rota
    if (prevLocationRef.current !== location.pathname) {
      setVisible(true);
      setProgress(30);
      
      const timer1 = setTimeout(() => setProgress(60), 100);
      const timer2 = setTimeout(() => setProgress(80), 300);
      const timer3 = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
      }, 500);
      
      prevLocationRef.current = location.pathname;
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [location.pathname]);
  
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
