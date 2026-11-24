import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminUsuarios from "../paginas/AdminUsuarios";
import { guardarSesion } from "../data/usuarios";

const usuariosIniciales = [
  { id: 1, run: "111111111", nombre: "Admin", apellidos: "NutriVida", correo: "admin@nutrivida.cl", fechaNacimiento: "", rol: "Administrador", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", activo: true },
  { id: 2, run: "222222222", nombre: "Carolina", apellidos: "Fuentes M.", correo: "nutricionista@nutrivida.cl", fechaNacimiento: "", rol: "Nutricionista", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", activo: true },
  { id: 3, run: "333333333", nombre: "Maria", apellidos: "Gonzales", correo: "maria@nutrivida.cl", fechaNacimiento: "2000-01-01", rol: "Paciente", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", activo: true },
];

describe("AdminUsuarios", () => {
  let usuariosMock = [...usuariosIniciales];

  beforeEach(() => {
    localStorage.clear();
    const admin = { id: 1, run: "111111111", nombre: "Admin", apellidos: "NutriVida", correo: "admin@nutrivida.cl", fechaNacimiento: "", rol: "Administrador", region: "", comuna: "", direccion: "", clave: "", activo: true };
    guardarSesion(admin);
    usuariosMock = [...usuariosIniciales];
    vi.restoreAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.includes("/api/usuarios") && method === "GET") {
        return new Response(JSON.stringify(usuariosMock), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.includes("/api/usuarios") && method === "POST") {
        const body = JSON.parse(String(init?.body || "{}"));
        const nuevo = { id: Date.now(), ...body, activo: body.activo ?? true };
        usuariosMock = [...usuariosMock, nuevo];
        return new Response(JSON.stringify(nuevo), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/usuarios\/\d+/) && method === "PUT") {
        const id = Number(url.split("/").pop());
        const body = JSON.parse(String(init?.body || "{}"));
        usuariosMock = usuariosMock.map((u) => (u.id === id ? { ...u, ...body } : u));
        const updated = usuariosMock.find((u) => u.id === id);
        return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/usuarios\/\d+/) && method === "DELETE") {
        const id = Number(url.split("/").pop());
        usuariosMock = usuariosMock.filter((u) => u.id !== id);
        return new Response(null, { status: 204 });
      }
      return new Response("not found", { status: 404 });
    });
  });

  it("lista los usuarios iniciales", async () => {
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    expect(await screen.findByText(/Admin NutriVida/i)).toBeInTheDocument();
  });

  it("filtra usuarios por busqueda", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    await user.type(screen.getByLabelText(/Buscar usuarios/i), "maria");
    expect(screen.getByText(/Maria Gonzales/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin NutriVida/i)).not.toBeInTheDocument();
  });

  it("crea un usuario nuevo", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    await user.type(screen.getByLabelText(/^RUN$/i), "12.345.678-5");
    await user.type(screen.getByLabelText(/^Nombre$/i), "Nuevo");
    await user.type(screen.getByLabelText(/^Apellidos$/i), "Usuario");
    await user.type(screen.getByLabelText(/^Correo$/i), "nuevo@test.cl");
    await user.type(screen.getByLabelText(/^Contrase/i), "Pass1234");
    await user.type(screen.getByLabelText(/Confirmar/i), "Pass1234");
    await user.click(screen.getByRole("button", { name: /Guardar usuario/i }));
    await waitFor(() => expect(screen.getByText("Nuevo Usuario")).toBeInTheDocument());
  });

  it("edita un usuario existente", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    await screen.findByText(/Admin NutriVida/i);
    await user.click(screen.getAllByRole("button", { name: /Editar/i })[0]);
    const nombre = screen.getByLabelText(/^Nombre$/i) as HTMLInputElement;
    await user.clear(nombre);
    await user.type(nombre, "AdminEditado");
    await user.click(screen.getByRole("button", { name: /Guardar edici/i }));
    await waitFor(() => expect(screen.getByText(/AdminEditado/)).toBeInTheDocument());
  });

  it("desactiva y elimina un usuario", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    await screen.findByText(/Admin NutriVida/i);
    await user.click(screen.getAllByRole("button", { name: /Desactivar/i })[0]);
    await waitFor(() => expect(screen.getAllByText(/Inactivo/i).length).toBeGreaterThan(0));
    const before = screen.getAllByRole("row").length;
    await user.click(screen.getAllByRole("button", { name: /Eliminar/i })[0]);
    await waitFor(() => expect(screen.getAllByRole("row").length).toBeLessThan(before));
  });
});