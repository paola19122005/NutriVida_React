import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminServicios from "../paginas/AdminServicio";
import { guardarSesion } from "../data/usuarios";

const serviciosIniciales = [
  { id: 1, tipo: "Consulta", nombre: "Primera consulta nutricional", duracion: "50 min", modalidad: "Presencial", precio: 35000, descripcion: "Desc", imagen: "/img/x.jpg" },
  { id: 2, tipo: "Consulta", nombre: "Control nutricional (seguimiento)", duracion: "30 min", modalidad: "Presencial", precio: 25000, descripcion: "Desc2", imagen: "/img/y.jpg" },
];

describe("AdminServicios", () => {
  let serviciosMock = [...serviciosIniciales];

  beforeEach(() => {
    localStorage.clear();
    const admin = { id: 1, run: "1", nombre: "Admin", apellidos: "NutriVida", correo: "admin@nutrivida.cl", fechaNacimiento: "", rol: "Administrador", region: "", comuna: "", direccion: "", clave: "", activo: true };
    guardarSesion(admin);
    serviciosMock = [...serviciosIniciales];
    vi.restoreAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      console.log("FETCH", method, url);
      if (url.includes("/api/servicios") && method === "GET") {
        return new Response(JSON.stringify(serviciosMock), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.includes("/api/servicios") && method === "POST") {
        const body = JSON.parse(String(init?.body || "{}"));
        const nuevo = { id: Date.now(), ...body };
        serviciosMock = [...serviciosMock, nuevo];
        return new Response(JSON.stringify(nuevo), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/servicios\/\d+/) && method === "PUT") {
        const id = Number(url.split("/").pop());
        const body = JSON.parse(String(init?.body || "{}"));
        serviciosMock = serviciosMock.map((s) => (s.id === id ? { ...s, ...body } : s));
        const updated = serviciosMock.find((s) => s.id === id);
        return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/servicios\/\d+/) && method === "DELETE") {
        const id = Number(url.split("/").pop());
        serviciosMock = serviciosMock.filter((s) => s.id !== id);
        return new Response(null, { status: 204 });
      }
      return new Response("not found", { status: 404 });
    });
  });

  it("lista los servicios iniciales", () => {
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    expect(screen.getByText("Primera consulta nutricional")).toBeInTheDocument();
  });

  it("filtra servicios por busqueda y limpia el filtro", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    await user.type(screen.getByLabelText(/Buscar servicios/i), "Control");
    expect(screen.getByText("Control nutricional (seguimiento)")).toBeInTheDocument();
    expect(screen.queryByText("Primera consulta nutricional")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Limpiar filtro/i }));
    expect(screen.getByText("Primera consulta nutricional")).toBeInTheDocument();
  });

  it("crea un servicio nuevo", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    await user.type(screen.getByLabelText(/digo/i), "TST001");
    await user.type(screen.getByLabelText(/^Nombre$/i), "Servicio Test");
    await user.type(screen.getByLabelText(/raci/i), "15");
    await user.selectOptions(screen.getByLabelText(/Modalidad/i), "Presencial");
    await user.type(screen.getByLabelText(/Precio/i), "10000");
    await user.type(screen.getByLabelText(/Ruta de imagen/i), "img/test.jpg");
    await user.type(screen.getByLabelText(/pci/i), "Descripcion suficiente para validar");
    await user.click(screen.getByRole("button", { name: /Guardar servicio/i }));
    await waitFor(() => expect(screen.getByText("Servicio Test")).toBeInTheDocument());
  });

  it("edita un servicio existente", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    await user.click(screen.getAllByRole("button", { name: /Editar/i })[0]);
    const nombre = screen.getByLabelText(/^Nombre$/i) as HTMLInputElement;
    await user.clear(nombre);
    await user.type(nombre, "Servicio Editado");
    const duracion = screen.getByLabelText(/raci/i) as HTMLInputElement;
    await user.clear(duracion);
    await user.type(duracion, "50");
    await user.click(screen.getByRole("button", { name: /Guardar servicio/i }));
    await waitFor(() => expect(screen.getByText("Servicio Editado")).toBeInTheDocument());
  });

  it("elimina un servicio", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    const before = screen.getAllByRole("row").length;
    await user.click(screen.getAllByRole("button", { name: /Eliminar/i })[0]);
    await waitFor(() => expect(screen.getAllByRole("row").length).toBeLessThan(before));
  });
});