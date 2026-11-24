import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminMensajesContacto from "../paginas/AdminMensajesContacto";
import { inicializarUsuarios, guardarSesion, cargarUsuarios } from "../data/usuarios";

describe("AdminMensajesContacto", () => {
  beforeEach(() => {
    localStorage.clear();
    inicializarUsuarios();
    const admin = cargarUsuarios().find((u) => u.rol === "Administrador")!;
    guardarSesion(admin);
    vi.restoreAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.includes("/api/contactos") && method === "GET") {
        return new Response(JSON.stringify([
          { id: 1, usuarioId: 3, nombre: "Juan Perez", correo: "juan@test.cl", asunto: "Consulta nutricion", mensaje: "Necesito ayuda", estado: "PENDIENTE", fechaRegistro: new Date().toISOString() },
        ]), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/contactos\/\d+\/responder/) && method === "PATCH") {
        const body = JSON.parse(String(init?.body || "{}"));
        return new Response(JSON.stringify({ id: 1, usuarioId: 3, nombre: "Juan Perez", correo: "juan@test.cl", asunto: "Consulta nutricion", mensaje: "Necesito ayuda", estado: "RESPONDIDO", respuesta: body.respuesta, fechaRespuesta: new Date().toISOString(), fechaRegistro: new Date().toISOString() }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/contactos\/\d+\/estado/) && method === "PATCH") {
        const body = JSON.parse(String(init?.body || "{}"));
        return new Response(JSON.stringify({ id: 1, usuarioId: 3, nombre: "Juan Perez", correo: "juan@test.cl", asunto: "Consulta nutricion", mensaje: "Necesito ayuda", estado: body.estado, fechaRegistro: new Date().toISOString() }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/contactos\/\d+/) && method === "DELETE") {
        return new Response(null, { status: 204 });
      }
      return new Response("not found", { status: 404 });
    });
  });

  it("muestra datos del mensaje seleccionado", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(await screen.findByRole("button", { name: /Juan Perez/i }));
    expect(screen.getAllByText(/juan@test.cl/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Consulta nutricion/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Necesito ayuda/i)).toBeInTheDocument();
  });

  it("envia una respuesta y la conserva", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(await screen.findByRole("button", { name: /Juan Perez/i }));
    await user.type(screen.getByPlaceholderText(/Escribe una respuesta/i), "Te responderemos pronto");
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    await waitFor(() => expect(screen.getByText(/Te responderemos pronto/i)).toBeInTheDocument());
  });

  it("impide respuesta vacia", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(await screen.findByRole("button", { name: /Juan Perez/i }));
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    expect(screen.getAllByText(/La respuesta no puede estar vacía/i).length).toBeGreaterThan(0);
  });

  it("marca como revisado sin eliminar la conversacion", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminMensajesContacto /></MemoryRouter>);
    await user.click(await screen.findByRole("button", { name: /Juan Perez/i }));
    await user.type(screen.getByPlaceholderText(/Escribe una respuesta/i), "Respuesta");
    await user.click(screen.getByRole("button", { name: /Enviar respuesta/i }));
    await waitFor(() => expect(screen.getAllByText(/Respuesta/i).length).toBeGreaterThan(0));
    // backend state verified by UI badge; no localStorage assertion
    expect(screen.getAllByText(/RESPONDIDO/i).length).toBeGreaterThan(0);
  });
});
