import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FormRegistro from "../componentes/organismos/FormRegistro";
import { cargarUsuarios } from "../data/usuarios";

describe("FormRegistro", () => {
  beforeEach(() => localStorage.clear());

  it("muestra error cuando el RUN es obligatorio", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FormRegistro /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Registrarme/i }));
    expect(screen.getByText("El RUN es obligatorio.")).toBeInTheDocument();
  });

  it("registra un usuario valido y muestra mensaje de exito", async () => {
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
    await user.click(screen.getByRole("button", { name: /Registrarme/i }));
    expect(screen.getByText("Registro realizado correctamente. Ya puedes iniciar sesi\u00f3n.")).toBeInTheDocument();
    expect(cargarUsuarios().some((u) => u.correo === "juan@test.cl")).toBe(true);
  });
});
