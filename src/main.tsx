import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { EventosProvider } from "./contexts/EventosContext";
import { DemandasProvider } from "./contexts/DemandasContext";
import { setVincularReembolsoCallback } from "./contexts/DemandasContext";
import { useEventos } from "./contexts/EventosContext";
import { useEffect } from "react";

function AppWrapper() {
  const { vincularReembolsoADespesa } = useEventos();
  
  useEffect(() => {
    setVincularReembolsoCallback(vincularReembolsoADespesa);
  }, [vincularReembolsoADespesa]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <EventosProvider>
    <DemandasProvider>
      <AppWrapper />
    </DemandasProvider>
  </EventosProvider>
);
