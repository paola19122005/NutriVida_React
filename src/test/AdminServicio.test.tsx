import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminServicios from "../paginas/AdminServicio";
import { inicializarUsuarios, guardarSesion, cargarUsuarios } from "../data/usuarios";

describe("AdminServicios", () => {
  beforeEach(() => {
    localStorage.clear();
    inicializarUsuarios();
    const admin = cargarUsuarios().find((u) => u.rol === "Administrador")!;
    guardarSesion(admin);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("lista los servicios iniciales", () => {
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    expect(screen.getByText("Primera consulta nutricional")).toBeInTheDocument();
  });

  it("filtra servicios por busqueda y limpia el filtro", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    await user.type(screen.getByLabelText(/Buscar servicios/i), "CN002");
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
    await user.type(screen.getByLabelText(/Precio/i), "10000");
    await user.type(screen.getByLabelText(/pci/i), "Descripcion suficiente para validar");
    await user.click(screen.getByRole("button", { name: /Guardar servicio/i }));
    expect(screen.getByText("Servicio Test")).toBeInTheDocument();
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
    expect(screen.getByText("Servicio Editado")).toBeInTheDocument();
  });

  it("elimina un servicio", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminServicios /></MemoryRouter>);
    const before = screen.getAllByRole("row").length;
    await user.click(screen.getAllByRole("button", { name: /Eliminar/i })[0]);
    await waitFor(() => expect(screen.getAllByRole("row").length).toBeLessThan(before));
  });
});
