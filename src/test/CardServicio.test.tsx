import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CardServicio from "./CardServicio";

vi.mock("../../utils/lista", () => ({
  agregarLista: vi.fn(),
}));

import { agregarLista } from "../../utils/lista";

describe("CardServicio", () => {
  const props = {
    id: "CN001",
    tipo: "Consulta",
    nombre: "Primera consulta",
    descripcion: "Desc",
    precio: 35000,
    duracion: "50",
    modalidad: "Presencial",
    imagen: "/img/x.jpg",
  };

  it("renderiza props tipadas", () => {
    render(<MemoryRouter><CardServicio {...props} /></MemoryRouter>);
    expect(screen.getByText("Primera consulta")).toBeInTheDocument();
    expect(screen.getByText("Consulta")).toBeInTheDocument();
    expect(screen.getByText(/Presencial/)).toBeInTheDocument();
    expect(screen.getByText(/\$35\.000CLP/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver detalle/i })).toHaveAttribute("href", "/servicio/CN001");
  });

  it("muestra selector de fecha al hacer clic y confirma agregado", async () => {
    const user = userEvent.setup();
    const onAgregado = vi.fn();
    render(<MemoryRouter><CardServicio {...props} onAgregado={onAgregado} /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Agregar a la lista/i }));
    expect(screen.getByText(/Selecciona la fecha/i)).toBeInTheDocument();
    const fecha = screen.getByLabelText(/Fecha del servicio/i) as HTMLInputElement;
    await user.type(fecha, "2026-10-20");
    await user.click(screen.getByRole("button", { name: /^Agregar$/i }));
    expect(agregarLista).toHaveBeenCalledWith("CN001", "2026-10-20");
    expect(onAgregado).toHaveBeenCalled();
    expect(screen.queryByText(/Selecciona la fecha/i)).not.toBeInTheDocument();
  });

  it("cancela el selector de fecha", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><CardServicio {...props} /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /Agregar a la lista/i }));
    await user.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(screen.queryByText(/Selecciona la fecha/i)).not.toBeInTheDocument();
  });
});

