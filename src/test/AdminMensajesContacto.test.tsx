import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminMensajesContacto from "../paginas/AdminMensajesContacto";
import { inicializarUsuarios, guardarSesion, cargarUsuarios } from "../data/usuarios";
import { agregarMensajeContacto, cargarMensajesContacto } from "../data/contactos";

describe("AdminMensajesContacto", () => {
  beforeEach(() => {
    localStorage.clear();
    inicializarUsuarios();
    const admin = cargarUsuarios().find((u) => u.rol === "Administrador")!;
    guardarSesion(admin);
    vi.spyOn(window, "alert").mockImplementation(() => {});
    agregarMensajeContacto({
      remitente: "Juan Perez",
      correo: "juan@test.cl",
      asunto: "Consulta nutricion",
      contenido: "Necesito ayuda",
    });
  });

  it("muestra datos del mensaje seleccionado", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Juan Perez/i }));
    expect(screen.getAllByText(/juan@test.cl/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Consulta nutricion/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Necesito ayuda/i)).toBeInTheDocument();
  });

  it("envia una respuesta y la conserva", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Juan Perez/i }));
    await user.type(screen.getByPlaceholderText(/Escribe una respuesta/i), "Te responderemos pronto");
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    await waitFor(() => expect(screen.getByText(/Te responderemos pronto/i)).toBeInTheDocument());
  });

  it("impide respuesta vacia", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Juan Perez/i }));
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    expect(screen.getByText(/La respuesta no puede estar vacía/i)).toBeInTheDocument();
  });

  it("marca como revisado sin eliminar la conversacion", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Juan Perez/i }));
    await user.type(screen.getByPlaceholderText(/Escribe una respuesta/i), "Respuesta");
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    await waitFor(() => expect(screen.getAllByText(/Respuesta/i).length).toBeGreaterThan(0));
    const msg = cargarMensajesContacto()[0];
    expect(msg.estado).toBe("Revisado");
    expect(msg.respuestas.length).toBe(1);
  });
});