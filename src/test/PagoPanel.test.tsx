import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Pago from "../paginas/Pago";

import { inicializarUsuarios, guardarSesion, cargarUsuarios } from "../data/usuarios";
import { asegurarDemoPaciente } from "../data/demoPaciente";
import { agregarLista } from "../utils/lista";
import { cargarServiciosPaciente } from "../data/serviciosPaciente";

describe("Pago y panel paciente", () => {
  beforeEach(() => {
    localStorage.clear();
    inicializarUsuarios();
    const paciente = cargarUsuarios().find((u) => u.rol === "Paciente")!;
    guardarSesion(paciente);
    asegurarDemoPaciente();
    agregarLista("2", "2027-01-10");
    vi.restoreAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.includes("/api/servicios") && method === "GET") {
        return new Response(JSON.stringify([{ id: 2, tipo: "Consulta", nombre: "Control nutricional (seguimiento)", duracion: "30 min", modalidad: "Presencial", precio: 25000, descripcion: "Desc", imagen: "/img/y.jpg" }]), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.includes("/api/pagos") && method === "POST") {
        const body = JSON.parse(String(init?.body || "{}"));
        return new Response(JSON.stringify({ id: 100, usuarioId: 3, servicioId: body.servicioId, servicioNombre: body.servicioNombre, monto: body.monto, fecha: body.fecha, metodoPago: body.metodoPago, estado: "PENDIENTE", fechaRegistro: new Date().toISOString() }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      if (url.match(/\/api\/pagos\/\d+\/pagar/) && method === "PATCH") {
        return new Response(JSON.stringify({ id: 100, estado: "PAGADO" }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response("not found", { status: 404 });
    });
  });

  it("paga un servicio pendiente y lo quita de pendientes", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Pago /></MemoryRouter>);
    await user.type(screen.getByLabelText(/Nombre del titular/i), "Maria Gonzalez");
    await user.type(screen.getByLabelText(/Número de tarjeta/i), "4111111111111111");
    await user.type(screen.getByLabelText(/Fecha de vencimiento/i), "12/30");
    await user.type(screen.getByLabelText(/CVV/i), "123");
    await user.click(screen.getByRole("button", { name: /Pagar/i }));
    await waitFor(() => expect(screen.getAllByText(/Pago realizado/i).length).toBeGreaterThan(0));

    const paciente = cargarUsuarios().find((u) => u.rol === "Paciente")!;
    const servicios = cargarServiciosPaciente().filter((s) => s.pacienteId === paciente.id);
    const pago = servicios.find((s) => s.servicioId === "2");
    expect(pago?.estadoPago).toBe("Pagado");
  });
});