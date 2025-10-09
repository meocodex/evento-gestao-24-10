import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { EventosProvider } from "./contexts/EventosContext";

createRoot(document.getElementById("root")!).render(
  <EventosProvider>
    <App />
  </EventosProvider>
);
