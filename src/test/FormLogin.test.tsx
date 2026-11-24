import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../contexto/AuthContext";
import FormLogin from "../componentes/organismos/FormLogin";
import { obtenerSesion, cerrarSesion } from "../data/usuarios";

describe("FormLogin", () => {
  beforeEach(() => {
    localStorage.clear();
    cerrarSesion();
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("No autenticado", { status: 401 })
    );
  });

  it("muestra errores de validacion para campos vacios", async () => {
    const user = userEvent.setup();
    render(<AuthProvider><MemoryRouter><FormLogin /></MemoryRouter></AuthProvider>);
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La contrase\u00f1a es obligatoria.")).toBeInTheDocument();
  });

  it("muestra error para correo invalido", async () => {
    const user = userEvent.setup();
    render(<AuthProvider><MemoryRouter><FormLogin /></MemoryRouter></AuthProvider>);
    await user.type(screen.getByRole("textbox"), "no-es-correo");
    await user.type(screen.getByLabelText(/^Contraseña$/i), "1234");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    expect(screen.getByText("Ingresa un correo v\u00e1lido.")).toBeInTheDocument();
  });

  it("muestra error general para credenciales incorrectas", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Credenciales inválidas", { status: 401 }));
    const user = userEvent.setup();
    render(<AuthProvider><MemoryRouter><FormLogin /></MemoryRouter></AuthProvider>);
    await user.type(screen.getByRole("textbox"), "admin@nutrivida.cl");
    await user.type(screen.getByLabelText(/^Contraseña$/i), "mala");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    await waitFor(() => expect(screen.getByText("Correo o contrase\u00f1a incorrectos.")).toBeInTheDocument());
  });

  it("muestra y oculta la contraseña con el boton del ojo", async () => {
    const user = userEvent.setup();
    render(<AuthProvider><MemoryRouter><FormLogin /></MemoryRouter></AuthProvider>);
    const input = screen.getByLabelText(/^Contraseña$/i) as HTMLInputElement;
    expect(input.type).toBe("password");

    const mostrar = screen.getByRole("button", { name: /Mostrar contrase\u00f1a/i });
    await user.click(mostrar);
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: /Ocultar contrase\u00f1a/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ocultar contrase\u00f1a/i }));
    expect(input.type).toBe("password");
  });

  it("inicia sesion y guarda sesion para credenciales validas", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ mensaje: "Login exitoso", usuario: { id: 1, run: "111111111", nombre: "Admin", apellidos: "NutriVida", correo: "admin@nutrivida.cl", fechaNacimiento: "", rol: "Administrador", region: "La Araucanía", comuna: "Temuco", direccion: "Av. Vitacura 2900", activo: true } }), { status: 200, headers: { "Content-Type": "application/json" } })));
    const user = userEvent.setup();
    render(<AuthProvider><MemoryRouter><FormLogin /></MemoryRouter></AuthProvider>);
    await user.type(screen.getByRole("textbox"), "admin@nutrivida.cl");
    await user.type(screen.getByLabelText(/^Contraseña$/i), "Admin1234");
    await user.click(screen.getByRole("button", { name: /Ingresar/i }));
    await waitFor(() => expect(obtenerSesion()?.correo).toBe("admin@nutrivida.cl"));
  });
});
