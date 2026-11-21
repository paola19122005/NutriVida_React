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
    agregarLista("CN002", "2027-01-10");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
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
    const cn = servicios.find((s) => s.servicioId === "CN002");
    expect(cn?.estadoPago).toBe("Pagado");
  });
});