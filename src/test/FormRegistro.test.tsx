import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FormRegistro from "../componentes/organismos/FormRegistro";

describe("FormRegistro", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("muestra error cuando el RUN es obligatorio", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FormRegistro /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Registrarme/i }));
    expect(screen.getByText("El RUN es obligatorio.")).toBeInTheDocument();
  });

  it("registra un usuario valido y muestra mensaje de exito", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ mensaje: "Registro exitoso", usuario: { id: 99, run: "11.111.111-1", nombre: "Juan", apellidos: "Perez", correo: "juan@test.cl", fechaNacimiento: "", rol: "Paciente", region: "Metropolitana de Santiago", comuna: "Santiago", direccion: "Calle 1", activo: true } }), { status: 200, headers: { "Content-Type": "application/json" } })));
    const user = userEvent.setup();
    render(<MemoryRouter><FormRegistro /></MemoryRouter>);
    await user.type(screen.getByLabelText(/^RUN$/i), "11.111.111-1");
    await user.type(screen.getByLabelText(/^Nombre$/i), "Juan");
    await user.type(screen.getByLabelText(/^Apellidos$/i), "Perez");
    await user.type(screen.getByLabelText(/^Correo$/i), "juan@test.cl");
    await user.selectOptions(screen.getByLabelText(/Tipo de usuario/i), "Paciente");
    await user.selectOptions(screen.getByLabelText(/Regi/i), "Metropolitana de Santiago");
    await user.selectOptions(screen.getByLabelText(/Comuna/i), "Santiago");
    await user.type(screen.getByLabelText(/Direcci/i), "Calle 1");
    await user.type(screen.getByLabelText(/Contrase/i), "1234");
    await user.click(screen.getByRole("button", { name: /Registrarme/i }));
    await waitFor(() => expect(screen.getByText("Registro realizado correctamente. Ya puedes iniciar sesi\u00f3n.")).toBeInTheDocument());
  });
});
