import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { inicializarUsuarios } from "./data/usuarios";

inicializarUsuarios();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
