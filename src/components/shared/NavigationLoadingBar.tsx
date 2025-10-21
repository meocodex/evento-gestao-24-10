import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';

export function NavigationLoadingBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (navigation.state === 'loading') {
      setVisible(true);
      setProgress(30);
      
      const timer1 = setTimeout(() => setProgress(60), 100);
      const timer2 = setTimeout(() => setProgress(80), 300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (navigation.state === 'idle' && visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, visible]);
  
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
