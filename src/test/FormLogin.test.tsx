import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FormLogin from "../componentes/organismos/FormLogin";
import { inicializarUsuarios, obtenerSesion, cerrarSesion } from "../data/usuarios";

describe("FormLogin", () => {
  beforeEach(() => {
    localStorage.clear();
    inicializarUsuarios();
    cerrarSesion();
  });

  it("muestra errores de validacion para campos vacios", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FormLogin /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La contrase\u00f1a es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error para correo invalido", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FormLogin /></MemoryRouter>);
    await user.type(screen.getByRole("textbox"), "no-es-correo");
    await user.type(screen.getByLabelText(/Contrase/i), "1234");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(screen.getByText("Ingresa un correo v\u00e1lido.")).toBeInTheDocument();
  });

  it("muestra error general para credenciales incorrectas", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FormLogin /></MemoryRouter>);
    await user.type(screen.getByRole("textbox"), "admin@nutrivida.cl");
    await user.type(screen.getByLabelText(/Contrase/i), "mala");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(screen.getByText("Correo o contrase\u00f1a incorrectos.")).toBeInTheDocument();
  });

  it("inicia sesion y guarda sesion para credenciales validas", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><FormLogin /></MemoryRouter>);
    await user.type(screen.getByRole("textbox"), "admin@nutrivida.cl");
    await user.type(screen.getByLabelText(/Contrase/i), "Admin1234");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(obtenerSesion()?.correo).toBe("admin@nutrivida.cl");
  });
});
