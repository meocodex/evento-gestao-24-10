import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { EventosProvider } from "./contexts/EventosContext";
import { ClientesProvider } from "./contexts/ClientesContext";
import { EstoqueProvider } from "./contexts/EstoqueContext";

createRoot(document.getElementById("root")!).render(
  <ClientesProvider>
    <EstoqueProvider>
      <EventosProvider>
        <App />
      </EventosProvider>
    </EstoqueProvider>
  </ClientesProvider>
);
