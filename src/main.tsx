import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { EventosProvider } from "./contexts/EventosContext";
import { ClientesProvider } from "./contexts/ClientesContext";

createRoot(document.getElementById("root")!).render(
  <EventosProvider>
    <ClientesProvider>
      <App />
    </ClientesProvider>
  </EventosProvider>
);
