import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminUsuarios from "../paginas/AdminUsuarios";
import { inicializarUsuarios, guardarSesion, cargarUsuarios } from "../data/usuarios";

describe("AdminUsuarios", () => {
  beforeEach(() => {
    localStorage.clear();
    inicializarUsuarios();
    const admin = cargarUsuarios().find((u) => u.rol === "Administrador")!;
    guardarSesion(admin);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("lista los usuarios iniciales", () => {
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    expect(screen.getByText(/Admin NutriVida/i)).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: /Guardar usuario/i }));
    expect(screen.getByText("Nuevo Usuario")).toBeInTheDocument();
  });

  it("edita un usuario existente", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    await user.click(screen.getAllByRole("button", { name: /Editar/i })[0]);
    const nombre = screen.getByLabelText(/^Nombre$/i) as HTMLInputElement;
    await user.clear(nombre);
    await user.type(nombre, "AdminEditado");
    await user.click(screen.getByRole("button", { name: /Guardar edici/i }));
    expect(screen.getByText(/AdminEditado/)).toBeInTheDocument();
  });

  it("desactiva y elimina un usuario", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>);
    await user.click(screen.getAllByRole("button", { name: /Desactivar/i })[0]);
    expect(screen.getAllByText(/Inactivo/i).length).toBeGreaterThan(0);
    const before = screen.getAllByRole("row").length;
    await user.click(screen.getAllByRole("button", { name: /Eliminar/i })[0]);
    await waitFor(() => expect(screen.getAllByRole("row").length).toBeLessThan(before));
  });
});
