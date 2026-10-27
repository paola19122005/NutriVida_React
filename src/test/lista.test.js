// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { agregarLista, obtenerEstadoServicio, obtenerLista, quitarLista, marcarServiciosPagados } from "../utils/lista";

describe("lista", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("agrega un servicio sin duplicarlo", () => {
    agregarLista("CN001", "2026-10-20");
    agregarLista("CN001", "2026-10-21");
    expect(obtenerLista()).toEqual(["CN001"]);
  });

  it("quita un servicio de la lista", () => {
    agregarLista("CN001", "2026-10-20");
    agregarLista("CN002", "2026-10-21");
    quitarLista("CN001");
    expect(obtenerLista()).toEqual(["CN002"]);
  });

  it("inicializa el estado de pago como Pendiente", () => {
    agregarLista("CN001", "2026-10-20");
    expect(obtenerEstadoServicio("CN001")).toBe("Pendiente");
  });

  it("marca servicios como Pagado", () => {
    agregarLista("CN001", "2026-10-20");
    marcarServiciosPagados(["CN001"]);
    expect(obtenerEstadoServicio("CN001")).toBe("Pagado");
  });

  it("no duplica servicios pagados", () => {
    agregarLista("CN001", "2026-10-20");
    marcarServiciosPagados(["CN001", "CN001"]);
    expect(obtenerLista()).toEqual(["CN001"]);
  });
});